import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { 
  Eye, 
  UserCheck, 
  Stethoscope, 
  ShieldAlert, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenMobileMenu,
}) => {
  const { currentUser, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'health_worker',
      label: 'Health Worker (ASHA)',
      icon: <UserCheck className="w-4 h-4 text-emerald-600" />,
      desc: 'Screen patients, capture images, issue referrals',
    },
    {
      role: 'doctor',
      label: 'Doctor / Reviewer',
      icon: <Stethoscope className="w-4 h-4 text-blue-600" />,
      desc: 'Review screening cases, validate care pathway',
    },
    {
      role: 'admin',
      label: 'Camp Administrator',
      icon: <ShieldAlert className="w-4 h-4 text-purple-600" />,
      desc: 'Audit logs, risk distributions, camp analytics',
    },
  ];

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Zone 1: Brand title, one line */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-800 transition-colors">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-950">
            RetinaReach
          </span>
        </button>
      </div>

      {/* Zone 2: Navigation Links (desktop breadcrumb / quick access) */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onNavigate('/dashboard')}
          className={`hover:text-slate-950 transition-colors ${currentPath === '/dashboard' ? 'text-teal-700 font-semibold' : ''}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('/patients')}
          className={`hover:text-slate-950 transition-colors ${currentPath === '/patients' ? 'text-teal-700 font-semibold' : ''}`}
        >
          Patients
        </button>
        <button
          onClick={() => onNavigate('/screening')}
          className={`hover:text-slate-950 transition-colors ${currentPath === '/screening' ? 'text-teal-700 font-semibold' : ''}`}
        >
          New Screening
        </button>
        <button
          onClick={() => onNavigate('/screenings')}
          className={`hover:text-slate-950 transition-colors ${currentPath === '/screenings' ? 'text-teal-700 font-semibold' : ''}`}
        >
          Screening History
        </button>
        <button
          onClick={() => onNavigate('/referrals')}
          className={`hover:text-slate-950 transition-colors ${currentPath === '/referrals' ? 'text-teal-700 font-semibold' : ''}`}
        >
          Referrals
        </button>
        <button
          onClick={() => onNavigate('/doctor-dashboard')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            currentPath === '/doctor-dashboard'
              ? 'bg-blue-100 text-blue-900'
              : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Review</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions & User Role Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Real-time Notification Bell */}
        <NotificationBell onNavigate={onNavigate} />

        {/* Role Switcher dropdown for quick evaluation of roles */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80"
          >
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span className="truncate max-w-[130px] sm:max-w-[170px]">
              {currentUser?.role === 'health_worker'
                ? 'Health Worker'
                : currentUser?.role === 'doctor'
                ? 'Doctor / Reviewer'
                : 'Administrator'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Operational Role
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    switchRole(r.role);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-start gap-2.5 transition-colors ${
                    currentUser?.role === r.role
                      ? 'bg-teal-50 text-teal-950 font-medium'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5">{r.icon}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{r.label}</div>
                    <div className="text-[11px] text-slate-500">{r.desc}</div>
                  </div>
                </button>
              ))}

              <div className="my-1 border-t border-slate-100"></div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  setRoleMenuOpen(false);
                  onNavigate('/login');
                }}
                className="w-full text-left p-2 rounded-lg text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick New Screening CTA */}
        <button
          type="button"
          onClick={() => onNavigate('/screening')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>New Screening</span>
        </button>
      </div>
    </header>
  );
};
