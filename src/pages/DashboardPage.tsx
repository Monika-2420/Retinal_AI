import React, { useState, useEffect } from 'react';
import { HealthWorkerStats, getDashboardMetrics, getScreenings } from '../services/db';
import { ScreeningWithDetails } from '../types';
import { MedicalDisclaimerBanner } from '../components/medical/MedicalDisclaimerBanner';
import { ReportModal } from '../components/screening/ReportModal';
import { CreateReferralModal } from '../components/referrals/CreateReferralModal';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Eye, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  SendHorizontal, 
  FileText, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Stethoscope
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string, params?: { patientId?: string }) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<HealthWorkerStats | null>(null);
  const [recentScreenings, setRecentScreenings] = useState<ScreeningWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for actions from dashboard
  const [selectedScreeningForReport, setSelectedScreeningForReport] = useState<ScreeningWithDetails | null>(null);
  const [referralScreening, setReferralScreening] = useState<ScreeningWithDetails | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [m, scr] = await Promise.all([
        getDashboardMetrics(),
        getScreenings(),
      ]);
      setStats(m);
      setRecentScreenings(scr.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk?: string) => {
    if (risk === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3 h-3" /> High Risk
        </span>
      );
    }
    if (risk === 'Moderate') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Moderate Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="w-3 h-3" /> Low Risk
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Community Health Camp Dashboard
            </h1>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
              Active Camp Session
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {currentUser?.health_center_name || 'Dharampur Primary Health Camp'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Camp Date: Sept 25, 2026
            </span>
          </div>
        </div>

        {/* Primary CTA button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/screening')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            <span>Launch New Screening</span>
          </button>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <MedicalDisclaimerBanner variant="compact" />

      {/* Hero Outreach Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="text-xs uppercase font-bold tracking-wider text-teal-400">
            Rural Outreach Screening Mission
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            Preventing Avoidable Blindness in Underserved Diabetic Populations
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Portable fundus photography paired with AI-assisted triage assists health workers in identifying non-proliferative and proliferative lesions for timely specialist referral.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/patients')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-teal-300" />
              <span>Registered Camp Patients ({stats?.totalPatients || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/referrals')}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              <SendHorizontal className="w-3.5 h-3.5 text-amber-300" />
              <span>Pending Referrals ({stats?.pendingReferrals || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/doctor-dashboard')}
              className="px-3.5 py-1.5 rounded-lg bg-blue-500/30 hover:bg-blue-500/40 text-xs font-semibold text-blue-200 transition-colors flex items-center gap-1.5 border border-blue-400/30"
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-300" />
              <span>Doctor Review Portal</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/health_worker_camp_1790314863382.jpg"
            alt="Health worker screening"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Metrics Stat Cards (Tabular figures, Clean unboxed metadata) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients Screened */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Patients Screened</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {loading ? '--' : stats?.totalScreened}
            </span>
            <span className="text-xs text-slate-500">
              / {stats?.totalPatients} registered
            </span>
          </div>
          <div className="text-[11px] text-teal-700 font-medium">
            {stats?.screeningRatePercentage}% coverage in camp
          </div>
        </div>

        {/* Total Screenings Executed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Screenings</span>
            <Eye className="w-4 h-4 text-teal-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {loading ? '--' : stats?.totalScreenings}
            </span>
            <span className="text-xs text-slate-500">fundus exams</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Left / Right eyes evaluated
          </div>
        </div>

        {/* High-Risk Cases */}
        <div className="bg-white rounded-xl border border-rose-200 p-4 space-y-2 bg-rose-50/30">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>High-Risk Cases</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-950">
              {loading ? '--' : stats?.highRiskCases}
            </span>
            <span className="text-xs text-rose-700">critical triage</span>
          </div>
          <div className="text-[11px] text-rose-800 font-medium">
            Urgent evaluation advised
          </div>
        </div>

        {/* Pending Referrals */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Referrals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-900">
              {loading ? '--' : stats?.pendingReferrals}
            </span>
            <span className="text-xs text-slate-500">awaiting hospital</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            {stats?.scheduledReferrals} scheduled
          </div>
        </div>
      </div>

      {/* Recent Screenings Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Recent Camp Screenings
            </h3>
            <p className="text-xs text-slate-500">
              Latest fundus image captures and AI preliminary classifications
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/screenings')}
            className="text-xs font-medium text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Screenings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Exam / Eye</th>
                <th className="py-3 px-4">Predicted Stage</th>
                <th className="py-3 px-4">Risk Classification</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Referral Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading screening records...
                  </td>
                </tr>
              ) : recentScreenings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No screenings recorded yet today. Click "Launch New Screening" above.
                  </td>
                </tr>
              ) : (
                recentScreenings.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Patient */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.patient?.full_name || 'Unknown'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.patient?.patient_id_code}</div>
                    </td>

                    {/* Exam / Eye */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={s.image_url}
                          alt="Thumbnail"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-medium text-slate-800 capitalize">
                            {s.eye_side === 'both' ? 'Both Eyes' : s.eye_side === 'right' ? 'OD (Right)' : 'OS (Left)'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(s.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Predicted DR Stage */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.result?.dr_stage || 'Under Review'}
                    </td>

                    {/* Risk Classification */}
                    <td className="py-3 px-4">
                      {getRiskBadge(s.result?.risk_category)}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {s.result?.confidence_score
                        ? `${(s.result.confidence_score * 100).toFixed(1)}%`
                        : '--'}
                    </td>

                    {/* Referral Status */}
                    <td className="py-3 px-4">
                      {s.referral ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 capitalize">
                          {s.referral.referral_status} ({s.referral.urgency})
                        </span>
                      ) : s.result?.risk_category === 'High' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                          Referral Needed
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">None required</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedScreeningForReport(s)}
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                          title="View Clinical Report"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {!s.referral && s.result?.risk_category === 'High' && (
                          <button
                            type="button"
                            onClick={() => setReferralScreening(s)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <SendHorizontal className="w-3 h-3" />
                            <span>Refer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screening Report Modal */}
      {selectedScreeningForReport && (
        <ReportModal
          isOpen={Boolean(selectedScreeningForReport)}
          onClose={() => setSelectedScreeningForReport(null)}
          screening={selectedScreeningForReport}
          onCreateReferral={(scr) => {
            setSelectedScreeningForReport(null);
            setReferralScreening(scr);
          }}
        />
      )}

      {/* Referral Creation Modal */}
      {referralScreening && referralScreening.patient && (
        <CreateReferralModal
          isOpen={Boolean(referralScreening)}
          onClose={() => setReferralScreening(null)}
          screening={referralScreening}
          patient={referralScreening.patient}
          screeningResult={referralScreening.result}
          onReferralCreated={() => {
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};
