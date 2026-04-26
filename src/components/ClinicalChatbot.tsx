import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { streamText } from 'ai';
import { UIMessage as Message } from '@ai-sdk/react';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Sparkles,
  Maximize2,
  Minimize2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Patient } from '../types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClinicalChatbotProps {
  patient?: Patient | null;
}

const SYSTEM_INSTRUCTION = `You are "Chengeto AI", a clinical decision support assistant for Primary Care Nurses (PCNs) in rural Zimbabwe. 
Your goal is to provide evidence-based recommendations for maternal care based on the Zimbabwe MOHCC guidelines.

Tone: Professional, supportive, clear, and concise. 
Constraint: Always state that your recommendations are for support and the final clinical decision rests with the nurse.
If data is missing, ask for it politely.`;

export default function ClinicalChatbot({ patient }: ClinicalChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      content: 'Hello! I am Chengeto AI. How can I assist you with clinical decisions today?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize the Google provider correctly with the API key from process.env
  const google = useMemo(() => createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || '',
  }), []);

  // Auto-scroll logic
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!process.env.GEMINI_API_KEY) {
      toast.error("Gemini API key is missing. Please check your environment variables.");
      return;
    }

    const userMessage: any = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const patientContext = patient ? `Current Patient Context:
Name: ${patient.name}
Age: ${patient.age}
Risk Level: ${patient.riskLevel}
Gestational Age: ${patient.gestationalAge} weeks
Recent Vitals: ${JSON.stringify(patient.vitals[patient.vitals.length - 1] || 'None')}` : '';

      // Prepare core messages for the SDK
      const coreMessages = [
        { role: 'system' as const, content: `${SYSTEM_INSTRUCTION}\n\n${patientContext}` },
        ...messages
          .filter(m => m.id !== 'welcome-message') // Filter out the local greeting to keep context clean
          .map(m => ({ 
            role: (m.role === 'assistant' ? 'assistant' : m.role === 'user' ? 'user' : 'system') as 'assistant' | 'user' | 'system', 
            content: m.content 
          })),
        { role: 'user' as const, content: input }
      ];

      const { textStream } = await streamText({
        model: google('gemini-2.0-flash-001'),
        messages: coreMessages,
      });

      let fullResponse = '';
      const assistantMessageId = (Date.now() + 1).toString();
      
      // Add empty assistant message to be updated
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      for await (const delta of textStream) {
        fullResponse += delta;
        setMessages(prev => 
          prev.map(m => m.id === assistantMessageId ? { ...m, content: fullResponse } : m)
        );
      }
    } catch (error) {
      console.error('Gemini Stream Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      toast.error(`Chat Error: ${errorMessage}`);
      // Remove the failed user message if appropriate, or just keep it
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300 ease-in-out",
      isOpen 
        ? (isMaximized ? "inset-4" : "bottom-6 right-6 w-[400px] h-[600px]") 
        : "bottom-6 right-6 w-14 h-14"
    )}>
      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <MessageSquare className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-full h-full bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Chengeto AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Support Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600"
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Patient Context Banner */}
            {patient && (
              <div className="px-4 py-2 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100/50 dark:border-blue-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-tight">
                    Analyzing: {patient.name}
                  </span>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                  patient.riskLevel === 'high' ? "bg-red-100 text-red-700" : 
                  patient.riskLevel === 'medium' ? "bg-amber-100 text-amber-700" : 
                  "bg-emerald-100 text-emerald-700"
                )}>
                  {patient.riskLevel} Risk
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
              <div className="space-y-4">
                {messages.filter(m => m.role !== 'system').length === 0 && (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4 opacity-40">
                    <Bot className="w-12 h-12" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold">How can I assist you today?</p>
                      <p className="text-xs max-w-[200px]">Ask about clinical protocols, risk factors, or specific patient recommendations.</p>
                    </div>
                  </div>
                )}
                {messages.filter(m => m.role !== 'system').map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3 max-w-[85%] relative group",
                      m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      m.role === 'user' ? "bg-slate-100 dark:bg-slate-800" : "bg-blue-600 text-white"
                    )}>
                      {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed relative",
                      m.role === 'user' 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-none" 
                        : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none shadow-sm"
                    )}>
                      {m.content}
                      
                      {/* Copy Button for AI Messages */}
                      {m.role !== 'user' && (
                        <button
                          onClick={() => copyToClipboard(m.content, m.id)}
                          className="absolute -right-8 top-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
                          title="Copy to clipboard"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3 mr-auto">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
              <form 
                onSubmit={handleSubmit}
                className="relative"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Chengeto AI..."
                  disabled={isLoading}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400 disabled:opacity-50"
                />
                <Button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-[9px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
                AI can make mistakes. Verify clinical decisions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
