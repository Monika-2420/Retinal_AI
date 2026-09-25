import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from '../services/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<boolean>;
  register: (data: {
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    healthCenterName: string;
  }) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isHealthWorker: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  firebaseAuthUser: FirebaseUser | null;
}

export const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  health_worker: {
    id: 'prof-001',
    user_id: 'user-hw-001',
    email: 'priya.sharma@healthcamp.org',
    full_name: 'Priya Sharma (ASHA Worker)',
    role: 'health_worker',
    phone: '+91 98450 12345',
    health_center_name: 'Dharampur Primary Health Post',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
  doctor: {
    id: 'prof-002',
    user_id: 'user-doc-002',
    email: 'dr.ramanath@ophthalmology.org',
    full_name: 'Dr. S. Ramanath, MS (Ophthalmology)',
    role: 'doctor',
    phone: '+91 94480 67890',
    health_center_name: 'District Eye Care Hospital',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
  admin: {
    id: 'prof-003',
    user_id: 'user-adm-003',
    email: 'admin@retinareach.org',
    full_name: 'Nisha Verma (Camp Administrator)',
    role: 'admin',
    phone: '+91 91234 56789',
    health_center_name: 'National Rural Eye Health Directorate',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
};

const AUTH_STORAGE_KEY = 'retinareach_auth_user_v2';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth state from localStorage & Firebase onAuthStateChanged
  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      } else {
        setCurrentUser(DEFAULT_USERS.health_worker);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USERS.health_worker));
      }
    } catch {
      setCurrentUser(DEFAULT_USERS.health_worker);
    } finally {
      setIsLoading(false);
    }

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setFirebaseAuthUser(user);
        if (user) {
          try {
            // Check if profile exists in Firestore users collection
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              const profile = userSnap.data() as UserProfile;
              setCurrentUser(profile);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
            } else {
              // Create profile in Firestore
              const role: UserRole = user.email?.includes('doctor') ? 'doctor' : 'health_worker';
              const newProfile: UserProfile = {
                id: `prof-${user.uid.substring(0, 8)}`,
                user_id: user.uid,
                email: user.email || 'user@retinareach.org',
                full_name: user.displayName || 'Clinical Staff Member',
                role,
                phone: user.phoneNumber || '',
                health_center_name: 'Dharampur Primary Health Camp',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              await setDoc(userDocRef, newProfile);
              setCurrentUser(newProfile);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
            }
          } catch (e) {
            console.warn('Firestore profile sync error:', e);
          }
        }
      });
    }

    return () => unsubscribe();
  }, []);

  // Google Sign-In with Firebase Auth
  const loginWithGoogle = async (preferredRole: UserRole = 'health_worker'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setFirebaseAuthUser(user);

      // Check if user already exists in Firestore
      let profile: UserProfile;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          profile = userSnap.data() as UserProfile;
        } else {
          profile = {
            id: `prof-${user.uid.substring(0, 8)}`,
            user_id: user.uid,
            email: user.email || '',
            full_name: user.displayName || 'Authorized Clinician',
            role: preferredRole,
            phone: user.phoneNumber || '',
            health_center_name: 'Community Eye Screening Unit',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await setDoc(userDocRef, profile);
        }
      } catch {
        profile = {
          id: `prof-${user.uid.substring(0, 8)}`,
          user_id: user.uid,
          email: user.email || '',
          full_name: user.displayName || 'Authorized Clinician',
          role: preferredRole,
          phone: '',
          health_center_name: 'Community Eye Screening Unit',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setCurrentUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch (err: unknown) {
      console.warn('Google Sign-In failed or was cancelled:', err);
      // Fallback to role preset if popup blocked or offline
      const fallbackUser = {
        ...DEFAULT_USERS[preferredRole],
        email: 'clinician.google@retinareach.org',
        full_name: preferredRole === 'doctor' ? 'Dr. Reviewer (Google Auth)' : 'Health Worker (Google Auth)',
      };
      setCurrentUser(fallbackUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 200));
      const targetRole =
        role ||
        (email.includes('doctor')
          ? 'doctor'
          : email.includes('admin')
          ? 'admin'
          : 'health_worker');

      const user = {
        ...DEFAULT_USERS[targetRole],
        email: email || DEFAULT_USERS[targetRole].email,
      };
      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

      // Persist in Firestore
      if (isFirebaseConfigured) {
        try {
          await setDoc(doc(db, 'users', user.id), user);
        } catch {
          // ignore
        }
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    fullName: string;
    role: UserRole;
    phone?: string;
    healthCenterName: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser: UserProfile = {
        id: `prof-${Date.now().toString(36)}`,
        user_id: `user-${Date.now().toString(36)}`,
        email: data.email,
        full_name: data.fullName,
        role: data.role,
        phone: data.phone,
        health_center_name: data.healthCenterName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));

      if (isFirebaseConfigured) {
        try {
          await setDoc(doc(db, 'users', newUser.id), newUser);
        } catch (e) {
          console.warn('Firestore profile write error:', e);
        }
      }
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isFirebaseConfigured && auth) {
      try {
        firebaseSignOut(auth);
      } catch {
        // ignore
      }
    }
    setCurrentUser(null);
    setFirebaseAuthUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const switchRole = (role: UserRole) => {
    const user = DEFAULT_USERS[role];
    setCurrentUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  };

  const isHealthWorker = currentUser?.role === 'health_worker';
  const isDoctor = currentUser?.role === 'doctor';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        loginWithGoogle,
        register,
        logout,
        switchRole,
        isHealthWorker,
        isDoctor,
        isAdmin,
        firebaseAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
