import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Eye, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('health_worker');
  const [phone, setPhone] = useState('');
  const [healthCenterName, setHealthCenterName] = useState('Rural Outreach Health Post');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Please provide full name and clinical email.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        phone: phone.trim(),
        healthCenterName: healthCenterName.trim(),
      });
      onNavigate('/dashboard');
    } catch {
      setError('Registration failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center text-white shadow-md">
            <Eye className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Staff Account Registration
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Join RetinaReach community camp screening network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-slate-200 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                placeholder="Dr. Anita Roy / ASHA Worker"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                placeholder="anita.roy@healthcamp.org"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Operational Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              >
                <option value="health_worker">Health Worker (ASHA / Field Staff)</option>
                <option value="doctor">Doctor / Reviewing Ophthalmologist</option>
                <option value="admin">Camp Coordinator / Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                placeholder="+91 98123 45678"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Health Camp or Hospital Name *
              </label>
              <input
                type="text"
                value={healthCenterName}
                onChange={(e) => setHealthCenterName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                placeholder="e.g. Sundarban Mobile Outreach Clinic"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'Registering...' : 'Create Staff Account'}</span>
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="font-medium text-teal-700 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
