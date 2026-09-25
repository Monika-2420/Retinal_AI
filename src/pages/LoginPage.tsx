import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Eye, ShieldCheck, UserCheck, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('priya.sharma@healthcamp.org');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('health_worker');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle(selectedRole);
      onNavigate(selectedRole === 'doctor' ? '/doctor-dashboard' : '/dashboard');
    } catch {
      setError('Google Sign-In was cancelled or failed.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your clinical login email.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(email, selectedRole);
      onNavigate('/dashboard');
    } catch {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    login(demoEmail, role).then(() => {
      onNavigate(role === 'admin' ? '/admin' : '/dashboard');
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Lockup */}
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-md">
            <Eye className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          RetinaReach
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          AI-Assisted Retinal Screening Platform for Rural Health Camps
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-slate-200 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
                placeholder="clinician@healthcamp.org"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Operating Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs"
              >
                <option value="health_worker">Health Worker (ASHA / Camp Staff)</option>
                <option value="doctor">Doctor / Reviewing Ophthalmologist</option>
                <option value="admin">Camp Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In with Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Firebase Google Auth Button */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-semibold">
              <span className="bg-white px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleSubmitting || submitting}
            className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-xs transition-colors text-xs flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleSubmitting ? 'Connecting with Google...' : `Sign in with Google (${selectedRole === 'doctor' ? 'Doctor' : 'Health Worker'})`}</span>
          </button>

          {/* Quick Instant Role Logins for Fast Review */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2 text-center uppercase tracking-wider">
              Quick 1-Click Role Login
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('health_worker', 'priya.sharma@healthcamp.org')}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 text-left text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-semibold text-slate-800">Health Worker</span>
                    <span className="text-[11px] text-slate-500 block">Priya Sharma · Field Camp</span>
                  </div>
                </div>
                <span className="text-teal-700 font-medium text-[11px]">Instant →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('doctor', 'dr.ramanath@ophthalmology.org')}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 text-left text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-semibold text-slate-800">Doctor / Reviewer</span>
                    <span className="text-[11px] text-slate-500 block">Dr. S. Ramanath, MS</span>
                  </div>
                </div>
                <span className="text-teal-700 font-medium text-[11px]">Instant →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin', 'admin@retinareach.org')}
                className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 text-left text-xs flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="font-semibold text-slate-800">Camp Administrator</span>
                    <span className="text-[11px] text-slate-500 block">Nisha Verma · Directorate</span>
                  </div>
                </div>
                <span className="text-teal-700 font-medium text-[11px]">Instant →</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Need an account for a new camp outreach worker? </span>
            <button
              type="button"
              onClick={() => onNavigate('/register')}
              className="font-semibold text-teal-700 hover:underline"
            >
              Register staff account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
