import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, signInWithGoogle, getUserProfile, createUserProfile } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  login: (role?: UserRole) => Promise<User>;
  loginWithEmail: (email: string, pass: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('chengeto_mock_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        let userProfile = await getUserProfile(firebaseUser.uid);
        if (!userProfile) {
          userProfile = await createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: pendingRole || 'pcn' 
          });
        }
        setProfile(userProfile);
      } else if (mockUser) {
        setProfile({
          uid: mockUser.uid,
          email: mockUser.email,
          displayName: mockUser.displayName,
          role: mockUser.role
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [pendingRole, mockUser]);

  const login = async (role?: UserRole) => {
    if (role) setPendingRole(role);
    return await signInWithGoogle();
  };

  const loginWithEmail = async (email: string, pass: string, role: UserRole) => {
    setPendingRole(role);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const existingProfile = await getUserProfile(result.user.uid);
      if (!existingProfile) {
        await createUserProfile(result.user.uid, {
          email: result.user.email || '',
          role: role
        });
      }
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Email/Password auth is disabled. Falling back to Mock Auth.');
        const mockSession = {
          uid: 'mock-user-' + role,
          email: email,
          displayName: role.toUpperCase() + ' (Mock)',
          role: role
        };
        setMockUser(mockSession);
        localStorage.setItem('chengeto_mock_user', JSON.stringify(mockSession));
        return mockSession as any;
      }

      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email') {
        try {
          const result = await createUserWithEmailAndPassword(auth, email, pass);
          await createUserProfile(result.user.uid, {
            email: result.user.email || '',
            role: role
          });
          return result.user;
        } catch (signupError: any) {
          throw error;
        }
      }
      throw error;
    }
  };

  const logout = async () => {
    await auth.signOut();
    setMockUser(null);
    localStorage.removeItem('chengeto_mock_user');
  };

  const currentUser = user || mockUser;
  const isMock = !!mockUser && !user;

  return (
    <FirebaseContext.Provider value={{ user: currentUser, profile, loading, isMock, login, loginWithEmail, logout }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
