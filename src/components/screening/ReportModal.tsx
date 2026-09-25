import React from 'react';
import { ScreeningWithDetails } from '../../types';
import { 
  Printer, 
  X, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  User, 
  SendHorizontal, 
  CheckCircle, 
  FileCheck 
} from 'lucide-react';

interface ReportModalProps {
  screening: ScreeningWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onCreateReferral?: (screening: ScreeningWithDetails) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  screening,
  isOpen,
  onClose,
  onCreateReferral,
}) => {
  if (!isOpen) return null;

  const { patient, result, referral } = screening;

  const handlePrint = () => {
    window.print();
  };

  const getRiskBadge = (risk?: string) => {
    if (risk === 'High') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" /> High Risk · Urgent Evaluation Advised
        </span>
      );
    }
    if (risk === 'Moderate') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Moderate Risk · Clinical Follow-up Advised
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" /> Low Risk · Routine Annual Screen
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print-container">
        {/* Action Header (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-semibold">Clinical Retinal Screening Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 font-sans">
          {/* Institution Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-teal-800">RetinaReach</span>
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Rural Health Outreach Initiative
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                AI-Assisted Ophthalmic Screening & Triage System · Primary Camp Record
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div className="font-semibold text-slate-900">Report Ref: {screening.id}</div>
              <div>Date: {new Date(screening.created_at).toLocaleDateString()}</div>
              <div>Center: {screening.health_camp_location}</div>
            </div>
          </div>

          {/* Mandatory Regulatory Warning Box */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>AI-Assisted Screening Result — Not a Medical Diagnosis</span>
            </div>
            <p className="leading-relaxed text-amber-900/90">
              This tool is intended for screening support and does not replace professional medical diagnosis or ophthalmological examination.
              Findings must be interpreted in conjunction with patient clinical presentation and confirmed by a licensed medical practitioner.
            </p>
          </div>

          {/* Patient Profile Grid */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-700" />
              Patient Demographics & Clinical History
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name</span>
                <span className="font-semibold text-slate-900 text-sm">{patient?.full_name || 'Anonymous'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Patient ID</span>
                <span className="font-mono font-medium text-slate-800">{patient?.patient_id_code}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age / Gender</span>
                <span className="font-medium text-slate-900 capitalize">
                  {patient?.age} yrs · {patient?.gender}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Camp Location</span>
                <span className="font-medium text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {patient?.location}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Diabetes Status</span>
                <span className="font-medium text-slate-900 capitalize">
                  {patient?.diabetes_status?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Duration of Diabetes</span>
                <span className="font-medium text-slate-900">
                  {patient?.duration_of_diabetes_years ? `${patient.duration_of_diabetes_years} years` : 'None / New'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Blood Glucose</span>
                <span className="font-medium text-slate-900">
                  {patient?.blood_sugar_value ? `${patient.blood_sugar_value} mg/dL` : 'Not recorded'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">HbA1c</span>
                <span className="font-medium text-slate-900">
                  {patient?.hba1c_percentage ? `${patient.hba1c_percentage}%` : 'Not available'}
                </span>
              </div>
            </div>
            {patient?.additional_notes && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs">
                <span className="text-slate-500 font-medium">Reported Symptoms & Notes: </span>
                <span className="text-slate-700">{patient.additional_notes}</span>
              </div>
            )}
          </div>

          {/* Retinal Image & AI Results Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Fundus Visual */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-950 flex flex-col items-center">
              <div className="text-[11px] text-slate-400 w-full flex justify-between mb-2 px-1">
                <span>Fundus Capture ({screening.eye_side.toUpperCase()})</span>
                <span className="font-mono">{screening.image_resolution || '1920x1440'}</span>
              </div>
              <img
                src={screening.image_url}
                alt="Retinal screening image"
                referrerPolicy="no-referrer"
                className="w-full h-56 sm:h-64 object-contain rounded-lg"
              />
              <div className="text-[10px] text-slate-400 mt-2 text-center">
                Digital optical fundus examination · {new Date(screening.created_at).toLocaleString()}
              </div>
            </div>

            {/* AI Screening Findings */}
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">
                  AI Screening Assessment
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Predicted DR Stage:</span>
                  <span className="text-base font-bold text-slate-950">{result?.dr_stage || 'Under Review'}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-700">Risk Classification:</span>
                  <div>{getRiskBadge(result?.risk_category)}</div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100 text-xs">
                  <span className="font-medium text-slate-600">Model Confidence:</span>
                  <span className="font-mono font-bold text-teal-800">
                    {result?.confidence_score ? `${(result.confidence_score * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>

                {result?.detected_features && result.detected_features.length > 0 && (
                  <div className="pt-3">
                    <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                      Visual Features Flagged:
                    </span>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      {result.detected_features.map((feat, idx) => (
                        <li key={idx} className="leading-snug">{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendation Box */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-teal-950 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-700" />
                  Clinical Recommendation & Follow-up
                </div>
                <p className="text-teal-900 leading-relaxed">
                  {result?.recommendation || 'Follow up with community health worker.'}
                </p>
              </div>
            </div>
          </div>

          {/* Referral Status Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <SendHorizontal className="w-4 h-4 text-teal-700" />
                Referral & Ophthalmology Escalation Status
              </h4>
              {referral ? (
                <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-800">
                  Referral Created · {referral.referral_status.toUpperCase()}
                </span>
              ) : (
                <span className="text-xs text-slate-500">No referral currently active</span>
              )}
            </div>

            {referral ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div>
                  <span className="text-slate-500 block">Target Facility:</span>
                  <span className="font-semibold text-slate-900">{referral.target_facility}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Care Level & Urgency:</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {referral.recommended_care_level.replace('_', ' ')} ({referral.urgency.replace('_', ' ')})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Appointment Date:</span>
                  <span className="font-medium text-slate-900">
                    {referral.appointment_date || 'Awaiting scheduling'}
                  </span>
                </div>
              </div>
            ) : (
              result?.risk_category === 'High' && (
                <div className="no-print mt-2 flex items-center justify-between bg-rose-50 p-3 rounded-lg border border-rose-200">
                  <span className="text-xs text-rose-800 font-medium">
                    Further ophthalmological evaluation recommended. Patient has not yet been referred.
                  </span>
                  {onCreateReferral && (
                    <button
                      type="button"
                      onClick={() => onCreateReferral(screening)}
                      className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-medium"
                    >
                      Create Referral Now
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* Doctor Sign-off / Review Signatures Section */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-1"></div>
              <div className="font-medium text-slate-900">Screening Health Worker (Signature & Date)</div>
              <div className="text-[11px] text-slate-500">{screening.screened_by_name || 'Community Health Worker'}</div>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-1"></div>
              <div className="font-medium text-slate-900">Reviewing Ophthalmologist / Doctor</div>
              <div className="text-[11px] text-slate-500">Dr. S. Ramanath, MS (Ophthalmology)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
