import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ScreeningWithDetails,
  RiskCategory,
  ReferralStatus,
  DRStage,
  UrgencyLevel,
} from '../types';
import {
  getScreenings,
  submitDoctorReview,
  getDashboardMetrics,
  HealthWorkerStats,
} from '../services/db';
import { MedicalDisclaimerBanner } from '../components/medical/MedicalDisclaimerBanner';
import {
  Stethoscope,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  SendHorizontal,
  Search,
  Filter,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UserCheck,
  Building2,
  FileCheck,
  ChevronRight,
  X,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface DoctorDashboardPageProps {
  onNavigate: (path: string, params?: { patientId?: string }) => void;
}

export const DoctorDashboardPage: React.FC<DoctorDashboardPageProps> = ({ onNavigate }) => {
  const { currentUser, isDoctor, isAdmin, switchRole } = useAuth();
  const [screenings, setScreenings] = useState<ScreeningWithDetails[]>([]);
  const [stats, setStats] = useState<HealthWorkerStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [referralFilter, setReferralFilter] = useState<string>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'needs_review' | 'reviewed'>('all');

  // Selected Screening for Deep Review
  const [selectedScreening, setSelectedScreening] = useState<ScreeningWithDetails | null>(null);

  // Doctor Review Form State
  const [doctorNotes, setDoctorNotes] = useState('');
  const [enableOverride, setEnableOverride] = useState(false);
  const [overrideRisk, setOverrideRisk] = useState<RiskCategory>('High');
  const [overrideStage, setOverrideStage] = useState<DRStage>('Severe DR');
  const [overrideReason, setOverrideReason] = useState('');
  const [referralAction, setReferralAction] = useState<ReferralStatus>('scheduled');
  const [urgency, setUrgency] = useState<UrgencyLevel>('immediate');
  const [targetFacility, setTargetFacility] = useState('District Eye Care Hospital - Retina Clinic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Image Controls in Modal
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageFilterMode, setImageFilterMode] = useState<'normal' | 'red_free' | 'high_contrast' | 'invert'>('normal');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, metrics] = await Promise.all([
        getScreenings(),
        getDashboardMetrics(),
      ]);
      setScreenings(list);
      setStats(metrics);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (scr: ScreeningWithDetails) => {
    setSelectedScreening(scr);
    setDoctorNotes(scr.result?.doctor_notes || '');
    const hasOverride = Boolean(scr.result?.doctor_override_risk || scr.result?.doctor_override_stage);
    setEnableOverride(hasOverride);
    setOverrideRisk(scr.result?.doctor_override_risk || scr.result?.risk_category || 'Moderate');
    setOverrideStage(scr.result?.doctor_override_stage || scr.result?.dr_stage || 'Moderate DR');
    setOverrideReason(scr.result?.doctor_override_reason || '');
    setReferralAction(scr.referral?.referral_status || 'scheduled');
    setUrgency(scr.referral?.urgency || 'immediate');
    setTargetFacility(scr.referral?.target_facility || 'District Eye Care Hospital - Retina Clinic');
    setZoomLevel(1);
    setImageFilterMode('normal');
    setSubmitSuccess(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScreening || !selectedScreening.result) return;
    if (!doctorNotes.trim()) {
      alert('Please enter your clinical assessment and findings.');
      return;
    }
    if (enableOverride && !overrideReason.trim()) {
      alert('Please provide a clinical justification for overriding the AI classification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitDoctorReview({
        screeningId: selectedScreening.id,
        doctorNotes,
        doctorId: currentUser?.id || 'prof-002',
        doctorName: currentUser?.full_name || 'Dr. S. Ramanath, MS (Ophthalmology)',
        overrideRisk: enableOverride ? overrideRisk : undefined,
        overrideStage: enableOverride ? overrideStage : undefined,
        overrideReason: enableOverride ? overrideReason : undefined,
        newReferralStatus: referralAction,
        urgency,
        targetFacility,
      });

      setSubmitSuccess('Clinical review and referral update committed. Health workers notified in real time.');
      await loadData();

      // Update current selected item
      if (selectedScreening) {
        setSelectedScreening({
          ...selectedScreening,
          result: res.result,
          referral: res.referral || selectedScreening.referral,
        });
      }

      setTimeout(() => {
        setSubmitSuccess(null);
      }, 3500);
    } catch (err: unknown) {
      alert(`Failed to save review: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // RBAC Access Control Gate
  if (!isDoctor && !isAdmin) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto my-12">
        <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Role-Based Access Control Gate
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              Doctor / Reviewer Credentials Required
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Under clinical governance protocols, the Reviewer Dashboard is strictly reserved for licensed ophthalmologists and consulting eye specialists to evaluate retinal fundus photography, add clinical findings, override AI classifications, and manage referrals.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Your Current Identity:</span>
              <span className="font-semibold text-slate-900">{currentUser?.full_name}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Current Role:</span>
              <span className="font-bold text-teal-700 uppercase">{currentUser?.role.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => switchRole('doctor')}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Switch to Doctor Role (Dr. Ramanath, MS)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Return to Camp Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter Screenings
  const filteredScreenings = screenings.filter((s) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const patientMatch =
        s.patient?.full_name.toLowerCase().includes(q) ||
        s.patient?.patient_id_code.toLowerCase().includes(q) ||
        s.health_camp_location.toLowerCase().includes(q);
      if (!patientMatch) return false;
    }

    // Risk category filter
    const effectiveRisk = s.result?.doctor_override_risk || s.result?.risk_category || 'Low';
    if (riskFilter !== 'all' && effectiveRisk !== riskFilter) {
      return false;
    }

    // Referral filter
    if (referralFilter !== 'all') {
      if (referralFilter === 'none') {
        if (s.referral) return false;
      } else if (s.referral?.referral_status !== referralFilter) {
        return false;
      }
    }

    // Review status filter
    if (reviewFilter === 'needs_review' && s.result?.reviewed_by_doctor) return false;
    if (reviewFilter === 'reviewed' && !s.result?.reviewed_by_doctor) return false;

    return true;
  });

  const getRiskBadge = (risk?: RiskCategory, isOverridden = false) => {
    const badgeColor =
      risk === 'High'
        ? 'bg-rose-100 text-rose-800 border-rose-200'
        : risk === 'Moderate'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200';

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}>
        {risk === 'High' && <AlertTriangle className="w-3 h-3" />}
        {risk} Risk
        {isOverridden && <span className="ml-1 text-[9px] bg-white/70 px-1 rounded uppercase">Overridden</span>}
      </span>
    );
  };

  const getImageFilterStyle = () => {
    switch (imageFilterMode) {
      case 'red_free':
        // Simulated green-channel/red-free filter by hue-rotating and boosting green
        return { filter: 'grayscale(100%) sepia(100%) hue-rotate(90deg) contrast(140%)' };
      case 'high_contrast':
        return { filter: 'contrast(180%) brightness(90%)' };
      case 'invert':
        return { filter: 'invert(100%) contrast(120%)' };
      default:
        return { filter: 'none' };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Doctor & Reviewer Tele-Ophthalmology Dashboard
                </h1>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                  Specialist Review Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Review automated AI diabetic retinopathy staging, apply optical filters, override risk classifications, and validate hospital referrals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-900">{currentUser?.full_name}</div>
            <div className="text-[11px] text-slate-500 font-mono">Consulting Ophthalmologist</div>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh screening queue"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <MedicalDisclaimerBanner variant="compact" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Awaiting Doctor Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {screenings.filter((s) => !s.result?.reviewed_by_doctor).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending clinical validation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-700 font-semibold mb-1">
            <span>High Risk DR Cases</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-900">
            {stats?.highRiskCases || screenings.filter((s) => (s.result?.doctor_override_risk || s.result?.risk_category) === 'High').length}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">Immediate intervention required</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Doctor Overridden</span>
            <Sliders className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.doctorOverrideCount || screenings.filter((s) => s.result?.doctor_override_risk || s.result?.doctor_override_stage).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">AI classifications revised</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Hospital Referrals</span>
            <SendHorizontal className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {screenings.filter((s) => Boolean(s.referral)).length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active care pathway referrals</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, ID code (RR-2026-...), camp..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Risk Filter */}
          <div className="lg:col-span-3">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Risk Categories</option>
              <option value="High">🚨 High Risk Only</option>
              <option value="Moderate">⚠️ Moderate Risk Only</option>
              <option value="Low">✅ Low Risk Only</option>
            </select>
          </div>

          {/* Referral Status Filter */}
          <div className="lg:col-span-3">
            <select
              value={referralFilter}
              onChange={(e) => setReferralFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Referral Statuses</option>
              <option value="pending">Pending Hospital Intake</option>
              <option value="scheduled">Scheduled at Eye Hospital</option>
              <option value="completed">Completed Treatment</option>
              <option value="none">No Referral Issued</option>
            </select>
          </div>

          {/* Review Filter */}
          <div className="lg:col-span-2">
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value as 'all' | 'needs_review' | 'reviewed')}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Review States</option>
              <option value="needs_review">Needs Review</option>
              <option value="reviewed">Reviewed by Doctor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screenings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Retinal Fundus Screening Worklist ({filteredScreenings.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Click &apos;Review Case&apos; to evaluate scan &amp; override classification
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
            <span>Loading ophthalmic screening worklist...</span>
          </div>
        ) : filteredScreenings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No screenings match current filters</p>
            <p className="text-[11px] text-slate-500 mt-1">Adjust search query or filter options above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Patient / ID</th>
                  <th className="py-3 px-4">Fundus Scan</th>
                  <th className="py-3 px-4">AI Prediction</th>
                  <th className="py-3 px-4">Effective Risk</th>
                  <th className="py-3 px-4">Referral Status</th>
                  <th className="py-3 px-4">Doctor Review</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScreenings.map((s) => {
                  const effectiveRisk = s.result?.doctor_override_risk || s.result?.risk_category || 'Low';
                  const effectiveStage = s.result?.doctor_override_stage || s.result?.dr_stage || 'No DR';
                  const isOverridden = Boolean(s.result?.doctor_override_risk || s.result?.doctor_override_stage);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{s.patient?.full_name || 'Anonymous'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {s.patient?.patient_id_code} · Age {s.patient?.age || '—'} ({s.patient?.gender || '—'})
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.health_camp_location}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={s.image_url}
                            alt="Fundus"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <span className="font-mono text-[11px] uppercase font-bold text-slate-700 block">
                              {s.eye_side === 'both' ? 'OU (Both)' : s.eye_side === 'right' ? 'OD (Right)' : 'OS (Left)'}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {new Date(s.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{s.result?.dr_stage || 'Pending'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Conf: {s.result ? `${(s.result.confidence_score * 100).toFixed(1)}%` : '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getRiskBadge(effectiveRisk, isOverridden)}
                        {isOverridden && (
                          <div className="text-[10px] text-purple-700 font-medium mt-0.5">
                            Stage: {effectiveStage}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {s.referral ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <SendHorizontal className="w-3 h-3" />
                              {s.referral.referral_status.toUpperCase()}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                              {s.referral.target_facility}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No referral</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {s.result?.reviewed_by_doctor ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Reviewed
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                              {s.result.reviewed_by_doctor_name || 'Dr. Ramanath'}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" /> Needs Review
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenReview(s)}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Review Case</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doctor Clinical Review Modal */}
      {selectedScreening && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Ophthalmologist Clinical Case Review &amp; Triage Override
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-mono mt-0.5">
                    <span>Patient: {selectedScreening.patient?.full_name}</span>
                    <span>·</span>
                    <span>ID: {selectedScreening.patient?.patient_id_code}</span>
                    <span>·</span>
                    <span>Eye: {selectedScreening.eye_side.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedScreening(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2-Column Split */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Fundus Viewer & Image Enhancement Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Image Display & Optical Filters */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 relative flex flex-col">
                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1">
                        Filter:
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageFilterMode('normal')}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          imageFilterMode === 'normal'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Standard RGB
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFilterMode('red_free')}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          imageFilterMode === 'red_free'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title="Simulates green light to highlight microaneurysms and hemorrhages"
                      >
                        Red-Free (Green)
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFilterMode('high_contrast')}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          imageFilterMode === 'high_contrast'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        High Contrast
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFilterMode('invert')}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          imageFilterMode === 'invert'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Invert
                      </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 text-slate-300">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                        className="p-1 hover:text-white rounded hover:bg-slate-800"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-[10px] w-10 text-center">
                        {(zoomLevel * 100).toFixed(0)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                        className="p-1 hover:text-white rounded hover:bg-slate-800"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setZoomLevel(1);
                          setImageFilterMode('normal');
                        }}
                        className="p-1 hover:text-white rounded hover:bg-slate-800 ml-1 text-slate-400"
                        title="Reset"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Fundus Image Canvas */}
                  <div className="relative overflow-hidden rounded-lg bg-black flex items-center justify-center min-h-[340px] max-h-[460px]">
                    <img
                      src={selectedScreening.image_url}
                      alt="Fundus detail"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        ...getImageFilterStyle(),
                        transition: 'transform 0.15s ease-out',
                      }}
                      className="max-h-[440px] w-auto object-contain cursor-grab"
                    />

                    {/* Watermark / Image Metadata */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[10px] text-slate-300 font-mono">
                      {selectedScreening.image_filename} · {selectedScreening.image_resolution || '1920x1440'}
                    </div>
                  </div>
                </div>

                {/* AI Automated Diagnostic Staging Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      Pre-Trained AI Staging Breakdown (Automated Output)
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Stored in &apos;screening_results&apos;
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">AI Predicted Stage</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedScreening.result?.dr_stage || 'No DR'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">AI Risk Triage</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedScreening.result?.risk_category || 'Low'} Risk
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Inference Confidence</span>
                      <span className="font-bold text-slate-900 text-sm font-mono">
                        {selectedScreening.result ? `${(selectedScreening.result.confidence_score * 100).toFixed(1)}%` : '—'}
                      </span>
                    </div>
                  </div>

                  {selectedScreening.result?.detected_features && selectedScreening.result.detected_features.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Detected Microvascular Lesions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedScreening.result.detected_features.map((f, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[11px]"
                          >
                            • {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800">AI Recommendation: </span>
                    {selectedScreening.result?.recommendation}
                  </div>
                </div>
              </div>

              {/* Right Column: Patient Profile & Doctor Assessment Form (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Patient Clinical Profile Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    Patient Clinical Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Age / Gender</span>
                      <span className="font-semibold text-slate-800">
                        {selectedScreening.patient?.age} yrs · {selectedScreening.patient?.gender}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Diabetes Status</span>
                      <span className="font-semibold text-slate-800">
                        {selectedScreening.patient?.diabetes_status.replace('_', ' ').toUpperCase()} (
                        {selectedScreening.patient?.duration_of_diabetes_years} yrs)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Blood Glucose / HbA1c</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {selectedScreening.patient?.blood_sugar_value ? `${selectedScreening.patient.blood_sugar_value} mg/dL` : '—'}
                        {selectedScreening.patient?.hba1c_percentage ? ` · ${selectedScreening.patient.hba1c_percentage}%` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Screening Location</span>
                      <span className="font-semibold text-slate-800 truncate block">
                        {selectedScreening.health_camp_location}
                      </span>
                    </div>
                  </div>

                  {selectedScreening.patient?.additional_notes && (
                    <div className="pt-1 text-[11px] text-slate-600 border-t border-slate-100">
                      <span className="font-semibold text-slate-700">Patient Notes: </span>
                      {selectedScreening.patient.additional_notes}
                    </div>
                  )}
                </div>

                {/* Success Banner */}
                {submitSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Assessment Recorded Successfully</p>
                      <p className="text-[11px] text-emerald-700">{submitSuccess}</p>
                    </div>
                  </div>
                )}

                {/* Doctor Assessment Form */}
                <form onSubmit={handleSubmitReview} className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      Doctor Professional Assessment
                    </span>
                    <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      Certified Review
                    </span>
                  </div>

                  {/* Doctor Clinical Notes */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clinical Findings &amp; Specialist Rationale *
                    </label>
                    <textarea
                      rows={3}
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="e.g. Slit-lamp biomicroscopy confirms multiple blot hemorrhages in superior nasal quadrant. Macular exudates noted within 1 disc diameter. Immediate OCT recommended..."
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>

                  {/* Doctor Override Toggle & Controls */}
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-purple-950 block">Override AI Risk Classification</span>
                        <span className="text-[11px] text-purple-700">
                          Reclassify patient based on expert ophthalmologist judgment
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        id="overrideToggle"
                        checked={enableOverride}
                        onChange={(e) => setEnableOverride(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                    </div>

                    {enableOverride && (
                      <div className="space-y-3 pt-2 border-t border-purple-200 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block font-semibold text-purple-900 text-[11px] mb-1">
                              Revised Risk Category *
                            </label>
                            <select
                              value={overrideRisk}
                              onChange={(e) => setOverrideRisk(e.target.value as RiskCategory)}
                              className="w-full p-2 text-xs border border-purple-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="High">🚨 High Risk</option>
                              <option value="Moderate">⚠️ Moderate Risk</option>
                              <option value="Low">✅ Low Risk</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-purple-900 text-[11px] mb-1">
                              Revised ICDR Stage *
                            </label>
                            <select
                              value={overrideStage}
                              onChange={(e) => setOverrideStage(e.target.value as DRStage)}
                              className="w-full p-2 text-xs border border-purple-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="No DR">No DR</option>
                              <option value="Mild DR">Mild DR</option>
                              <option value="Moderate DR">Moderate DR</option>
                              <option value="Severe DR">Severe DR</option>
                              <option value="Proliferative DR">Proliferative DR</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-purple-900 text-[11px] mb-1">
                            Clinical Justification for Override *
                          </label>
                          <input
                            type="text"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="e.g. AI undergraded foveal threat; circinate lipid ring present."
                            className="w-full p-2 text-xs border border-purple-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                            required={enableOverride}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Referral Status & Care Pathway Action */}
                  <div className="space-y-3 pt-1">
                    <span className="font-bold text-slate-800 block">Referral Pathway Management</span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                          Referral Status Action
                        </label>
                        <select
                          value={referralAction}
                          onChange={(e) => setReferralAction(e.target.value as ReferralStatus)}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="scheduled">Approve &amp; Schedule Referral</option>
                          <option value="pending">Keep as Pending Intake</option>
                          <option value="completed">Mark Treatment Completed</option>
                          <option value="cancelled">Cancel / Not Indicated</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                          Clinical Urgency
                        </label>
                        <select
                          value={urgency}
                          onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                          className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="immediate">Immediate (48 Hours)</option>
                          <option value="within_7_days">Within 7 Days</option>
                          <option value="within_30_days">Within 30 Days</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                        Designated Ophthalmology Center
                      </label>
                      <input
                        type="text"
                        value={targetFacility}
                        onChange={(e) => setTargetFacility(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        placeholder="District Eye Care Hospital, Retina OPD"
                      />
                    </div>
                  </div>

                  {/* Submission Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedScreening(null)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'Saving Review...' : 'Commit Review & Notify Workers'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
