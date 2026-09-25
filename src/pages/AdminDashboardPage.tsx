import React, { useState, useEffect } from 'react';
import { HealthWorkerStats, getDashboardMetrics, getScreenings, resetDemoData } from '../services/db';
import { ScreeningWithDetails } from '../types';
import { MedicalDisclaimerBanner } from '../components/medical/MedicalDisclaimerBanner';
import { 
  ShieldCheck, 
  BarChart3, 
  PieChart, 
  Users, 
  Eye, 
  AlertTriangle, 
  SendHorizontal, 
  Activity, 
  RotateCcw,
  Building,
  CheckCircle,
  Database
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<HealthWorkerStats | null>(null);
  const [screenings, setScreenings] = useState<ScreeningWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [m, sc] = await Promise.all([
        getDashboardMetrics(),
        getScreenings(),
      ]);
      setStats(m);
      setScreenings(sc);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => {
    resetDemoData();
    setResetMessage('Database restored to default verified camp dataset.');
    setTimeout(() => setResetMessage(null), 3000);
    loadAdminData();
  };

  const totalRisks = (stats?.lowRiskCases || 0) + (stats?.moderateRiskCases || 0) + (stats?.highRiskCases || 0) || 1;
  const lowPct = Math.round(((stats?.lowRiskCases || 0) / totalRisks) * 100);
  const modPct = Math.round(((stats?.moderateRiskCases || 0) / totalRisks) * 100);
  const highPct = Math.round(((stats?.highRiskCases || 0) / totalRisks) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Admin & Rural Screening Analytics
            </h1>
            <span className="text-[11px] font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
              Directorate Oversight
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregated population metrics, AI risk distributions, and tertiary hospital referral pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/database-schema')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-teal-700" />
            <span>PostgreSQL Schema & RLS</span>
          </button>
          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-700 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      <MedicalDisclaimerBanner variant="compact" />

      {/* Primary 4-Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Enrolled Patients</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {stats?.totalPatients || 0}
          </div>
          <div className="text-[11px] text-teal-700 font-medium">Across 3 rural camps</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Fundus Screenings</span>
            <Eye className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
            {stats?.totalScreenings || 0}
          </div>
          <div className="text-[11px] text-slate-500">100% QA validated</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <div className="text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>High Risk Identified</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-rose-950">
            {stats?.highRiskCases || 0}
          </div>
          <div className="text-[11px] text-rose-800 font-medium">Requiring immediate care</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Hospital Referrals</span>
            <SendHorizontal className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-950">
            {(stats?.pendingReferrals || 0) + (stats?.scheduledReferrals || 0) + (stats?.completedReferrals || 0)}
          </div>
          <div className="text-[11px] text-blue-800 font-medium">
            {stats?.scheduledReferrals} scheduled · {stats?.pendingReferrals} pending
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-teal-700" />
                AI Risk Classification Distribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Proportion of camp attendees across clinical triage tiers
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500">{totalRisks} evaluated</span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-2">
            <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden flex">
              <div
                style={{ width: `${lowPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Low Risk: ${lowPct}%`}
              />
              <div
                style={{ width: `${modPct}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Moderate Risk: ${modPct}%`}
              />
              <div
                style={{ width: `${highPct}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`High Risk: ${highPct}%`}
              />
            </div>

            {/* Legend & Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/60">
                <span className="font-medium text-emerald-900 block">Low Risk</span>
                <span className="text-lg font-bold font-mono text-emerald-950">{stats?.lowRiskCases || 0}</span>
                <span className="text-[11px] text-emerald-700 block">{lowPct}% of cohort</span>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/60">
                <span className="font-medium text-amber-900 block">Moderate Risk</span>
                <span className="text-lg font-bold font-mono text-amber-950">{stats?.moderateRiskCases || 0}</span>
                <span className="text-[11px] text-amber-700 block">{modPct}% of cohort</span>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200/60">
                <span className="font-medium text-rose-900 block">High Risk</span>
                <span className="text-lg font-bold font-mono text-rose-950">{stats?.highRiskCases || 0}</span>
                <span className="text-[11px] text-rose-700 block">{highPct}% of cohort</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Pipeline & Hospital Triage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-teal-700" />
                Referral Escalation Pipeline
              </h3>
              <p className="text-[11px] text-slate-500">
                Status of patients dispatched to district ophthalmology centers
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Pending */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-amber-900">1. Pending Hospital Intake</span>
                <span className="font-mono font-bold text-slate-800">{stats?.pendingReferrals || 0}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((stats?.pendingReferrals || 0) / 5) * 100}%` }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            {/* Scheduled */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-blue-900">2. Scheduled Appointments</span>
                <span className="font-mono font-bold text-slate-800">{stats?.scheduledReferrals || 0}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((stats?.scheduledReferrals || 0) / 5) * 100}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-emerald-900">3. Confirmed Evaluations Completed</span>
                <span className="font-mono font-bold text-slate-800">{stats?.completedReferrals || 0}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${((stats?.completedReferrals || 0) / 5) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 mt-2">
              All high-risk referrals are accompanied by transportation coordination with village ASHA workers.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Screening Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-teal-700" />
          Recent Screening Audits & Camp Logs
        </h3>

        <div className="divide-y divide-slate-100 text-xs text-slate-700">
          {screenings.slice(0, 5).map((s) => (
            <div key={s.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                <div>
                  <span className="font-semibold text-slate-900">{s.patient?.full_name}</span>
                  <span className="text-slate-400 font-mono text-[11px] ml-1.5">({s.patient?.patient_id_code})</span>
                  <span className="text-slate-500 text-[11px] ml-2">
                    · Result: <span className="font-medium text-slate-800">{s.result?.dr_stage}</span> ({s.result?.risk_category} Risk)
                  </span>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400 font-mono">
                {new Date(s.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
