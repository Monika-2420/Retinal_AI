import React, { useState } from 'react';
import { DiabetesStatus, Gender, Patient } from '../../types';
import { createPatient } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, X, AlertCircle } from 'lucide-react';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: Patient) => void;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated,
}) => {
  const { currentUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(currentUser?.health_center_name || 'Dharampur Community Camp');
  const [diabetesStatus, setDiabetesStatus] = useState<DiabetesStatus>('type_2');
  const [durationYears, setDurationYears] = useState('5');
  const [bloodSugar, setBloodSugar] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !age) {
      setError('Please fill in patient name, age, and contact phone.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Please provide a valid age between 1 and 120.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createPatient({
        full_name: fullName.trim(),
        age: ageNum,
        gender,
        phone: phone.trim(),
        location: location.trim(),
        diabetes_status: diabetesStatus,
        duration_of_diabetes_years: parseFloat(durationYears) || 0,
        blood_sugar_value: bloodSugar ? parseFloat(bloodSugar) : undefined,
        hba1c_percentage: hba1c ? parseFloat(hba1c) : undefined,
        additional_notes: notes.trim(),
        created_by: currentUser?.id,
      });

      onPatientCreated(created);
      onClose();
    } catch {
      setError('Failed to register patient in database. Please verify input.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-semibold text-base">New Patient Registration</h3>
              <p className="text-xs text-slate-400">Rural Health Camp Screening Roster</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              1. Demographics & Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kamala Devi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 54"
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Camp / Village Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dharampur Health Post"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Diabetic Profile */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              2. Diabetes & Metabolic Profile
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Diabetes Status *
                </label>
                <select
                  value={diabetesStatus}
                  onChange={(e) => setDiabetesStatus(e.target.value as DiabetesStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                >
                  <option value="type_2">Type 2 Diabetes</option>
                  <option value="type_1">Type 1 Diabetes</option>
                  <option value="prediabetes">Pre-diabetic</option>
                  <option value="gestational">Gestational Diabetes</option>
                  <option value="none">None / Suspected</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={durationYears}
                  onChange={(e) => setDurationYears(e.target.value)}
                  placeholder="e.g. 8"
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  HbA1c (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  placeholder="e.g. 8.2"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Symptoms */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              3. Visual Symptoms & Clinical Notes
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Blurring in dim light, floaters, history of hypertension or cataract surgery"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Actions */}
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
              <UserPlus className="w-4 h-4" />
              <span>{submitting ? 'Registering Patient...' : 'Save & Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
