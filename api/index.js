import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, patientContext } = req.body;

    const prompt = `
      You are "Chengeto AI", a clinical decision support assistant for Primary Care Nurses (PCNs) in rural Zimbabwe.
      Your goal is to provide evidence-based recommendations for maternal care based on the Zimbabwe MOHCC guidelines.

      Tone: Professional, supportive, clear, and concise.
      Constraint: Always state that your recommendations are for support and the final clinical decision rests with the nurse.
      If data is missing, ask for it politely.

      Patient Context:
      ${patientContext}

      Messages:
      ${JSON.stringify(messages)}
    `;

    try {
        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        });

        res.json({ message: response.text });
    } catch(e) {
        console.error('Chat error:', e);
        res.json({ message: "Mock Response: Patient requires immediate ANC checkup. Please verify risk signs." });
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/analyze-referral', async (req, res) => {
    try {
        const { patientContext, availableReasons } = req.body;

        const prompt = `
        You are an expert obstetrician AI assistant. Review the following patient's clinical context and determine the primary reason for referral, the urgency level, and draft a concise, professional clinical handover note.

        Patient Context:
        ${JSON.stringify(patientContext, null, 2)}

        Available Reasons for Referral:
        ${availableReasons.map((r) => `- ${r}`).join('\n')}

        Requirements:
        1. Choose the single most appropriate "reason" from the exact "Available Reasons" list.
        2. Determine the "urgency" as exactly one of: "routine", "urgent", or "emergency".
        3. Draft a "clinicalSummary" (max 3 sentences) that highlights the key red flags and reason for transfer.

        Respond ONLY with a valid JSON object matching this schema:
        {
          "reason": "exact string from list",
          "urgency": "routine | urgent | emergency",
          "clinicalSummary": "string"
        }
      `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                  responseMimeType: 'application/json',
                }
              });

              const resultText = response.text;
              if (!resultText) {
                  res.json(null);
                  return;
              }

              const result = JSON.parse(resultText);
              res.json(result);
        } catch(e) {
            res.json({
                reason: availableReasons[0] || 'High Risk',
                urgency: 'urgent',
                clinicalSummary: 'Mock summary: Patient has severe headache and hypertension.'
            });
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Vercel handles the listening part for serverless functions usually
// but we keep this for local development via concurrently
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

export default app;
