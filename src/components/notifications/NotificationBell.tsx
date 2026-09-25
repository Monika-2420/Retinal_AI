import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ExternalLink, AlertTriangle, SendHorizontal, Stethoscope, Clock } from 'lucide-react';
import { AppNotification } from '../../types';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from '../../services/db';

interface NotificationBellProps {
  onNavigate: (path: string, params?: { patientId?: string }) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial load
    getNotifications().then(setNotifications);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications((updatedList) => {
      setNotifications(updatedList);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: AppNotification) => {
    await markNotificationAsRead(notif.id);
    setIsOpen(false);

    if (notif.type === 'high_risk_screening') {
      onNavigate('/screenings');
    } else if (notif.type === 'referral_updated' || notif.referral_id) {
      onNavigate('/referrals');
    } else if (notif.patient_id) {
      onNavigate('/patients', { patientId: notif.patient_id });
    }
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case 'high_risk_screening':
        return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'referral_updated':
        return <SendHorizontal className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'doctor_review':
        return <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-hidden"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-600 rounded-full px-1 shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-bold tracking-tight">Real-Time Alerts</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold bg-rose-500/90 text-white px-1.5 py-0.2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsAsRead()}
                className="text-[11px] text-teal-300 hover:text-teal-100 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex border-b border-slate-100 bg-slate-50/80 px-3 py-1.5 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                <p className="font-medium text-slate-600">No notifications</p>
                <p className="text-[11px] mt-0.5">High-risk alerts and referral updates will appear here in real time.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 cursor-pointer transition-colors flex items-start gap-3 hover:bg-slate-50 ${
                    !item.read ? 'bg-teal-50/40' : 'bg-white'
                  }`}
                >
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs ${!item.read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatTime(item.created_at)}
                      </span>
                      <span className="text-teal-700 font-semibold flex items-center gap-0.5">
                        View details <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Synchronized via Firebase Realtime & Outreach Camp Protocol
          </div>
        </div>
      )}
    </div>
  );
};
