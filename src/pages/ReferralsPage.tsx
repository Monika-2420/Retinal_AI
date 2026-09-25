import React, { useState, useEffect } from 'react';
import { ReferralStatus, ReferralWithDetails } from '../types';
import { getReferrals, updateReferralStatus } from '../services/db';
import { ReportModal } from '../components/screening/ReportModal';
import { MedicalDisclaimerBanner } from '../components/medical/MedicalDisclaimerBanner';
import { useAuth } from '../contexts/AuthContext';
import { 
  SendHorizontal, 
  Clock, 
  CalendarCheck, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  FileText,
  Filter,
  CheckCircle
} from 'lucide-react';

interface ReferralsPageProps {
  onNavigate: (path: string, params?: { patientId?: string }) => void;
}

export const ReferralsPage: React.FC<ReferralsPageProps> = ({ onNavigate }) => {
  const { isDoctor, isAdmin } = useAuth();
  const [referrals, setReferrals] = useState<ReferralWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'all'>('all');
  
  // Updating Status modal / inline edit
  const [editingReferral, setEditingReferral] = useState<ReferralWithDetails | null>(null);
  const [newStatus, setNewStatus] = useState<ReferralStatus>('scheduled');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Report Modal
  const [selectedScreeningForReport, setSelectedScreeningForReport] = useState<any>(null);

  useEffect(() => {
    loadReferrals();
  }, [statusFilter]);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const data = await getReferrals(statusFilter);
      setReferrals(data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReferral) return;

    setIsUpdating(true);
    try {
      await updateReferralStatus(editingReferral.id, newStatus, doctorNotes);
      setEditingReferral(null);
      setDoctorNotes('');
      await loadReferrals();
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (status === 'scheduled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          <CalendarCheck className="w-3 h-3" /> Scheduled
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3" /> Pending Hospital Intake
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'immediate') {
      return <span className="text-rose-700 font-bold">Immediate (48h)</span>;
    }
    if (urgency === 'within_7_days') {
      return <span className="text-amber-700 font-medium">Within 7 days</span>;
    }
    return <span className="text-slate-600">Within 30 days</span>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Ophthalmology Referral Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage escalation pathways for patients identified with high or moderate retinal risk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/screening')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <SendHorizontal className="w-4 h-4" />
          <span>New Screening & Referral</span>
        </button>
      </div>

      <MedicalDisclaimerBanner variant="card" />

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Referrals
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'scheduled'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Scheduled
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              statusFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {referrals.length} referral case{referrals.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Referrals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-10 text-center text-slate-400 text-xs">
            Loading referral records...
          </div>
        ) : referrals.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-700">No referrals matching selected filter.</p>
            <p className="text-[11px]">All high-risk screening cases have been processed.</p>
          </div>
        ) : (
          referrals.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-colors shadow-xs"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      {ref.patient?.full_name || 'Patient'}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-500">
                      {ref.patient?.patient_id_code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ref.patient?.age}y · {ref.patient?.gender} · {ref.patient?.location}
                  </div>
                </div>

                <div>{getStatusBadge(ref.referral_status)}</div>
              </div>

              {/* Target Facility & Urgency */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Facility:</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">
                    {ref.target_facility}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Triage Urgency:</span>
                  <div>{getUrgencyBadge(ref.urgency)}</div>
                </div>
              </div>

              {/* Rationale */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Referral Rationale:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded border border-slate-100">
                  {ref.reason}
                </p>
              </div>

              {/* Appointment / Notes */}
              <div className="text-[11px] text-slate-500 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3">
                <div>
                  Referral Date: <span className="font-medium text-slate-700">{ref.referral_date}</span>
                  {ref.appointment_date && (
                    <span className="ml-2 font-medium text-teal-800">
                      · Appt: {ref.appointment_date}
                    </span>
                  )}
                </div>
                <div>
                  Care Level: <span className="font-medium capitalize text-slate-700">{ref.recommended_care_level.replace('_', ' ')}</span>
                </div>
              </div>

              {ref.notes && (
                <div className="text-[11px] text-slate-500 bg-amber-50/60 p-2 rounded">
                  <strong>Notes:</strong> {ref.notes}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedScreeningForReport({
                      ...ref.screening,
                      patient: ref.patient,
                      result: ref.screening_result,
                      referral: ref,
                    });
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Clinical Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingReferral(ref);
                    setNewStatus(ref.referral_status);
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Status Modal */}
      {editingReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="font-bold text-base text-slate-900">
              Update Referral Status
            </h3>
            <p className="text-slate-500">
              Patient: <span className="font-semibold text-slate-800">{editingReferral.patient?.full_name}</span> ({editingReferral.patient?.patient_id_code})
            </p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Referral Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReferralStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                >
                  <option value="pending">Pending (Awaiting Appointment)</option>
                  <option value="scheduled">Scheduled (Appointment Booked)</option>
                  <option value="completed">Completed (Evaluation Done)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Doctor / Reviewer Action Notes
                </label>
                <textarea
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="e.g. Appointment confirmed with Dr. Ramanath for Oct 2; transport confirmed."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReferral(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold"
                >
                  {isUpdating ? 'Saving...' : 'Save Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screening Report Modal */}
      {selectedScreeningForReport && (
        <ReportModal
          isOpen={Boolean(selectedScreeningForReport)}
          onClose={() => setSelectedScreeningForReport(null)}
          screening={selectedScreeningForReport}
        />
      )}
    </div>
  );
};
