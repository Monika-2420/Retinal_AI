import React, { useEffect, useState, useRef } from 'react';
import { AppNotification } from '../../types';
import { subscribeToNotifications, markNotificationAsRead } from '../../services/db';
import { AlertTriangle, SendHorizontal, Stethoscope, X, ArrowRight } from 'lucide-react';

interface RealtimeToastListenerProps {
  onNavigate: (path: string, params?: { patientId?: string }) => void;
}

// Gentle synthetic medical audio chime using Web Audio API (zero external assets)
function playNotificationChime(isUrgent = false) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    const freq1 = isUrgent ? 880 : 587.33; // A5 for urgent, D5 for normal
    const freq2 = isUrgent ? 1174.66 : 783.99; // D6 or G5

    osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
    osc2.frequency.setValueAtTime(freq2, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start(ctx.currentTime + 0.08);

    osc1.stop(ctx.currentTime + 0.45);
    osc2.stop(ctx.currentTime + 0.45);
  } catch {
    // Audio context may be muted or blocked by browser before user interaction
  }
}

export const RealtimeToastListener: React.FC<RealtimeToastListenerProps> = ({ onNavigate }) => {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const isFirstMount = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((list) => {
      if (isFirstMount.current) {
        list.forEach((n) => knownNotificationIds.current.add(n.id));
        isFirstMount.current = false;
        return;
      }

      // Find any newly arrived notifications
      const newItems = list.filter((n) => !knownNotificationIds.current.has(n.id));
      if (newItems.length > 0) {
        newItems.forEach((n) => knownNotificationIds.current.add(n.id));
        const latest = newItems[0];
        setActiveToast(latest);
        playNotificationChime(latest.risk_category === 'High' || latest.type === 'high_risk_screening');

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          setActiveToast(null);
        }, 7000);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAction = async () => {
    if (!activeToast) return;
    await markNotificationAsRead(activeToast.id);
    const toast = activeToast;
    setActiveToast(null);

    if (toast.type === 'high_risk_screening') {
      onNavigate('/screenings');
    } else if (toast.type === 'referral_updated' || toast.referral_id) {
      onNavigate('/referrals');
    } else if (toast.patient_id) {
      onNavigate('/patients', { patientId: toast.patient_id });
    }
  };

  if (!activeToast) return null;

  const isHighRisk = activeToast.risk_category === 'High' || activeToast.type === 'high_risk_screening';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`rounded-2xl shadow-2xl p-4 border flex items-start gap-3 backdrop-blur-md ${
          isHighRisk
            ? 'bg-rose-950/95 text-white border-rose-500/50'
            : 'bg-slate-900/95 text-white border-teal-500/50'
        }`}
      >
        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isHighRisk ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white'}`}>
          {isHighRisk ? (
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          ) : activeToast.type === 'referral_updated' ? (
            <SendHorizontal className="w-5 h-5" />
          ) : (
            <Stethoscope className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isHighRisk ? 'text-rose-300' : 'text-teal-300'}`}>
              {isHighRisk ? 'Critical Triage Alert' : 'Real-Time Clinical Update'}
            </span>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">{activeToast.title}</h4>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Outreach Tele-Eye Alert</span>
            <button
              type="button"
              onClick={handleAction}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
                isHighRisk
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              <span>View Case</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
