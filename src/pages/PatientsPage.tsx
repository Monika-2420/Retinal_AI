import React, { useState, useEffect } from 'react';
import { PatientWithHistory, DiabetesStatus } from '../types';
import { getPatients } from '../services/db';
import { RegisterPatientModal } from '../components/patients/RegisterPatientModal';
import { ReportModal } from '../components/screening/ReportModal';
import { CreateReferralModal } from '../components/referrals/CreateReferralModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Phone, 
  Calendar,
  Activity,
  FileText
} from 'lucide-react';

interface PatientsPageProps {
  onNavigate: (path: string, params?: { patientId?: string }) => void;
  selectedPatientId?: string;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  onNavigate,
  selectedPatientId,
}) => {
  const [patients, setPatients] = useState<PatientWithHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [screeningFilter, setScreeningFilter] = useState('all');
  const [diabetesFilter, setDiabetesFilter] = useState('all');

  // Modals & Profile view
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<PatientWithHistory | null>(null);
  const [selectedScreeningForReport, setSelectedScreeningForReport] = useState<any>(null);
  const [referralScreening, setReferralScreening] = useState<any>(null);

  useEffect(() => {
    loadPatients();
  }, [searchQuery, screeningFilter, diabetesFilter]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients(searchQuery, screeningFilter, diabetesFilter);
      setPatients(data);
      if (selectedPatientId) {
        const found = data.find((p) => p.id === selectedPatientId || p.patient_id_code === selectedPatientId);
        if (found) setViewingPatient(found);
      }
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
    if (risk === 'Low') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle className="w-3 h-3" /> Low Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
        <Clock className="w-3 h-3" /> Pending Screen
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Patient Registry & History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse registered rural community health camp patients and view screening records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRegisterModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, ID (e.g. RR-2026-0041), phone, or village..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Screening Status Filter */}
          <div className="md:col-span-3">
            <select
              value={screeningFilter}
              onChange={(e) => setScreeningFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Screening Statuses</option>
              <option value="screened">Screened (Has Records)</option>
              <option value="unscreened">Unscreened (Pending)</option>
              <option value="high_risk">High Risk Only</option>
              <option value="referred">Referred Cases</option>
            </select>
          </div>

          {/* Diabetes Status Filter */}
          <div className="md:col-span-3">
            <select
              value={diabetesFilter}
              onChange={(e) => setDiabetesFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Diabetes Categories</option>
              <option value="type_2">Type 2 Diabetes</option>
              <option value="type_1">Type 1 Diabetes</option>
              <option value="prediabetes">Pre-diabetic</option>
              <option value="gestational">Gestational</option>
              <option value="none">None / Suspected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Name & Gender</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Camp Location</th>
                <th className="py-3 px-4">Diabetes Profile</th>
                <th className="py-3 px-4">Screening Status</th>
                <th className="py-3 px-4">Enrolled Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Loading registered patient directory...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-medium text-slate-600">No matching patients found.</p>
                    <p className="text-[11px]">Try adjusting your search criteria or register a new patient.</p>
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const risk = p.latest_screening?.result?.risk_category;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setViewingPatient(p)}
                      className="hover:bg-teal-50/40 cursor-pointer transition-colors"
                    >
                      {/* Patient ID */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {p.patient_id_code}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.full_name}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{p.gender} · {p.phone}</div>
                      </td>

                      {/* Age */}
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {p.age} yrs
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{p.location}</span>
                        </div>
                      </td>

                      {/* Diabetes Profile */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 capitalize">
                          {p.diabetes_status.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {p.duration_of_diabetes_years} yrs
                          {p.blood_sugar_value ? ` · ${p.blood_sugar_value} mg/dL` : ''}
                        </div>
                      </td>

                      {/* Screening Status */}
                      <td className="py-3 px-4">
                        {p.screenings_count > 0 ? (
                          <div className="space-y-0.5">
                            {getRiskBadge(risk)}
                            <div className="text-[10px] text-slate-500">
                              {p.latest_screening?.result?.dr_stage}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-medium">
                            Pending Initial Screen
                          </span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigate('/screening', { patientId: p.id })}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-medium text-[11px] flex items-center gap-1 transition-colors"
                            title="Screen Patient"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Screen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewingPatient(p)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="View Profile"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Profile Drawer Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">{viewingPatient.full_name}</h3>
                  <span className="font-mono text-xs bg-slate-800 text-teal-300 px-2 py-0.5 rounded">
                    {viewingPatient.patient_id_code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rural Camp Patient Medical Record & Longitudinal Screening Timeline
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPatient(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-xs text-slate-800">
              {/* Demographics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Age & Gender</span>
                  <span className="font-semibold text-slate-900 capitalize">
                    {viewingPatient.age} yrs · {viewingPatient.gender}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <span className="font-medium text-slate-900">{viewingPatient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Camp Location</span>
                  <span className="font-medium text-slate-900">{viewingPatient.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Enrolled Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(viewingPatient.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Diabetes Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block">Diabetes Status</span>
                  <span className="text-sm font-bold text-slate-900 capitalize mt-0.5 block">
                    {viewingPatient.diabetes_status.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Known duration: {viewingPatient.duration_of_diabetes_years} years
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block">Blood Glucose</span>
                  <span className="text-sm font-bold font-mono text-teal-800 mt-0.5 block">
                    {viewingPatient.blood_sugar_value ? `${viewingPatient.blood_sugar_value} mg/dL` : 'Not tested'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    HbA1c: {viewingPatient.hba1c_percentage ? `${viewingPatient.hba1c_percentage}%` : 'N/A'}
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block">Active Referrals</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {viewingPatient.active_referral ? viewingPatient.active_referral.referral_status.toUpperCase() : 'None active'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {viewingPatient.active_referral?.target_facility || 'Primary outreach'}
                  </span>
                </div>
              </div>

              {viewingPatient.additional_notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                  <span className="font-semibold text-amber-950 block mb-0.5">Clinical Notes / Symptoms:</span>
                  <p className="text-amber-900 leading-relaxed">{viewingPatient.additional_notes}</p>
                </div>
              )}

              {/* Screening History Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Patient Screening History ({viewingPatient.screenings_count} scans)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const pid = viewingPatient.id;
                      setViewingPatient(null);
                      onNavigate('/screening', { patientId: pid });
                    }}
                    className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Perform New Screening</span>
                  </button>
                </div>

                {viewingPatient.latest_screening ? (
                  <div className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={viewingPatient.latest_screening.image_url}
                        alt="Screening thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {viewingPatient.latest_screening.result?.dr_stage || 'Completed Exam'}
                          </span>
                          {getRiskBadge(viewingPatient.latest_screening.result?.risk_category)}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Exam Date: {new Date(viewingPatient.latest_screening.created_at).toLocaleDateString()} · Eye: {viewingPatient.latest_screening.eye_side.toUpperCase()}
                        </div>
                        <div className="text-slate-600 text-[11px] line-clamp-1">
                          {viewingPatient.latest_screening.result?.recommendation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScreeningForReport({
                            ...viewingPatient.latest_screening,
                            patient: viewingPatient,
                            referral: viewingPatient.active_referral,
                          });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 space-y-2">
                    <Eye className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-medium text-slate-600">No retinal scans recorded for this patient yet.</p>
                    <p className="text-[11px]">Perform their baseline screening using the portable fundus camera.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPatient(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Register Modal */}
      <RegisterPatientModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onPatientCreated={(p) => {
          loadPatients();
        }}
      />

      {/* Report Modal */}
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

      {/* Create Referral Modal */}
      {referralScreening && referralScreening.patient && (
        <CreateReferralModal
          isOpen={Boolean(referralScreening)}
          onClose={() => setReferralScreening(null)}
          screening={referralScreening}
          patient={referralScreening.patient}
          screeningResult={referralScreening.result}
          onReferralCreated={() => {
            loadPatients();
          }}
        />
      )}
    </div>
  );
};
