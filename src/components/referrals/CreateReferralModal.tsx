import React, { useState } from 'react';
import { CareLevel, Patient, Screening, ScreeningResult, UrgencyLevel } from '../../types';
import { createReferral } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { SendHorizontal, X, AlertTriangle, Building2, Calendar, FileText } from 'lucide-react';

interface CreateReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  screening: Screening;
  patient: Patient;
  screeningResult?: ScreeningResult;
  onReferralCreated: () => void;
}

export const CreateReferralModal: React.FC<CreateReferralModalProps> = ({
  isOpen,
  onClose,
  screening,
  patient,
  screeningResult,
  onReferralCreated,
}) => {
  const { currentUser } = useAuth();
  const [careLevel, setCareLevel] = useState<CareLevel>('district_hospital');
  const [urgency, setUrgency] = useState<UrgencyLevel>(
    screeningResult?.risk_category === 'High' ? 'immediate' : 'within_30_days'
  );
  const [targetFacility, setTargetFacility] = useState('District Eye Hospital - Vitreo-Retina OPD');
  const [reason, setReason] = useState(
    screeningResult?.risk_category === 'High'
      ? `AI screening classified ${screeningResult.dr_stage} with high risk. Multiple retinal lesions detected requiring urgent dilated fundoscopy and OCT evaluation.`
      : `Moderate diabetic retinopathy risk identified in routine screening. Recommended secondary evaluation.`
  );
  const [notes, setNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFacility.trim() || !reason.trim()) {
      setError('Please provide the target medical center and referral rationale.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createReferral({
        screening_id: screening.id,
        patient_id: patient.id,
        reason,
        recommended_care_level: careLevel,
        urgency,
        target_facility: targetFacility,
        notes,
        appointment_date: appointmentDate || undefined,
        referred_by: currentUser?.id || 'prof-001',
      });
      onReferralCreated();
      onClose();
    } catch {
      setError('Failed to create referral record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SendHorizontal className="w-5 h-5 text-teal-200" />
            <h3 className="font-semibold text-base">Create Clinical Ophthalmology Referral</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-teal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 pt-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <strong>Further evaluation recommended:</strong> This patient exhibits{' '}
              <span className="font-semibold">{screeningResult?.dr_stage || 'high risk retinal signs'}</span>. 
              Referral connects rural camp patients to certified hospital care.
            </div>
          </div>
        </div>

        {/* Patient Summary Header */}
        <div className="px-6 py-3 mt-2 bg-slate-50 border-y border-slate-100 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-700">
          <div>
            <span className="text-slate-400">Patient: </span>
            <span className="font-semibold text-slate-900">{patient.full_name}</span> ({patient.patient_id_code})
          </div>
          <div>
            <span className="text-slate-400">Age: </span>
            <span className="font-medium text-slate-900">{patient.age} yrs</span>
          </div>
          <div>
            <span className="text-slate-400">Diabetes: </span>
            <span className="font-medium text-slate-900 capitalize">{patient.diabetes_status.replace('_', ' ')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recommended Care Level */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Recommended Care Level *
              </label>
              <select
                value={careLevel}
                onChange={(e) => setCareLevel(e.target.value as CareLevel)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              >
                <option value="district_hospital">District Hospital Ophthalmology</option>
                <option value="tertiary_eye_hospital">Tertiary Eye Hospital</option>
                <option value="vitreoretinal_specialist">Vitreoretinal Specialist</option>
                <option value="primary_clinic">Primary Health Post / Community Follow-up</option>
              </select>
            </div>

            {/* Referral Urgency */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Triage Urgency *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              >
                <option value="immediate">Immediate (Within 48-72 hours)</option>
                <option value="within_7_days">High Priority (Within 7 days)</option>
                <option value="within_30_days">Routine Secondary (Within 30 days)</option>
              </select>
            </div>
          </div>

          {/* Target Facility */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Target Hospital / Facility *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={targetFacility}
                onChange={(e) => setTargetFacility(e.target.value)}
                placeholder="e.g. District Eye Care Center, Apex Retina Dept"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
          </div>

          {/* Reason for Referral */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Clinical Rationale & Specific Findings *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              required
            />
          </div>

          {/* Appointment Date & Transport Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Scheduled Appointment Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Logistics & Transport Assistance Notes
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. ASHA worker accompanying; bus pass provided"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-white bg-teal-700 hover:bg-teal-800 rounded-lg font-medium transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>{submitting ? 'Registering Referral...' : 'Dispatch Referral'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
