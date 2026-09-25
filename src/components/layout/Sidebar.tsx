import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Eye, 
  History, 
  SendHorizontal, 
  FileText, 
  ShieldCheck, 
  Database,
  X,
  Building2,
  Phone,
  Stethoscope
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, isDoctor, isAdmin } = useAuth();

  const navItems = [
    {
      id: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: '/patients',
      label: 'Patients',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: '/screening',
      label: 'New Screening',
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: '/screenings',
      label: 'Screening History',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: '/referrals',
      label: 'Referrals',
      icon: <SendHorizontal className="w-4 h-4" />,
    },
    {
      id: '/doctor-dashboard',
      label: 'Doctor Reviewer Portal',
      icon: <Stethoscope className="w-4 h-4 text-blue-400" />,
    },
    {
      id: '/reports',
      label: 'Reports',
      icon: <FileText className="w-4 h-4" />,
    },
    ...(isAdmin || isDoctor
      ? [
          {
            id: '/admin',
            label: 'Admin & Analytics',
            icon: <ShieldCheck className="w-4 h-4" />,
          },
        ]
      : []),
    {
      id: '/database-schema',
      label: 'Database & Schema',
      icon: <Database className="w-4 h-4" />,
    },
  ];

  const handleItemClick = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Camp Center Indicator */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Outreach Unit
          </span>
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-white rounded"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-200 font-medium">
          <Building2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-snug">
            {currentUser?.health_center_name || 'Rural Health Outreach Camp'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-teal-700/80 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-teal-200' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active User Card & Emergency Support */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="font-medium text-slate-200 truncate">
            {currentUser?.full_name}
          </div>
          <div className="text-[11px] text-teal-400 capitalize mt-0.5">
            {currentUser?.role?.replace('_', ' ')}
          </div>
          {currentUser?.phone && (
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{currentUser.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-2 text-[11px] text-slate-400 px-1 leading-tight">
          RetinaReach Camp Client v1.2 · Offline-Ready
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
};
