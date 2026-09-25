import React, { useState, useEffect, useRef } from 'react';
import { PatientWithHistory, EyeSide, DRStage, RiskCategory, ScreeningWithDetails } from '../types';
import { getPatients, createScreening, SAMPLE_FUNDUS_IMAGES } from '../services/db';
import { defaultAiService, PipelineStep, AnalysisOutput } from '../services/aiScreeningService';
import { FundusViewer } from '../components/medical/FundusViewer';
import { MedicalDisclaimerBanner } from '../components/medical/MedicalDisclaimerBanner';
import { CreateReferralModal } from '../components/referrals/CreateReferralModal';
import { ReportModal } from '../components/screening/ReportModal';
import { useAuth } from '../contexts/AuthContext';
import { 
  UploadCloud, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  SendHorizontal, 
  FileText, 
  Sparkles, 
  Search,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';

interface ScreeningPageProps {
  preselectedPatientId?: string;
  onNavigate: (path: string) => void;
}

export const ScreeningPage: React.FC<ScreeningPageProps> = ({
  preselectedPatientId,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Patient Selection
  const [patients, setPatients] = useState<PatientWithHistory[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithHistory | null>(null);

  // Screening Configuration
  const [eyeSide, setEyeSide] = useState<EyeSide>('both');
  const [campLocation, setCampLocation] = useState(
    currentUser?.health_center_name || 'Dharampur Primary Health Post'
  );
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Image Upload & Validation
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageSizeBytes, setImageSizeBytes] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Pipeline Execution State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [screeningResult, setScreeningResult] = useState<AnalysisOutput | null>(null);
  const [completedScreening, setCompletedScreening] = useState<ScreeningWithDetails | null>(null);

  // Modals
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const list = await getPatients();
    setPatients(list);
    if (preselectedPatientId) {
      const match = list.find((p) => p.id === preselectedPatientId || p.patient_id_code === preselectedPatientId);
      if (match) setSelectedPatient(match);
    } else if (list.length > 0 && !selectedPatient) {
      // Default to first patient with unfulfilled screening or first in list
      const unscreened = list.find((p) => p.screenings_count === 0);
      setSelectedPatient(unscreened || list[0]);
    }
  };

  // Image Validation: max 15MB, min 20KB, supported types
  const validateAndSetImage = (file: File) => {
    setUploadError(null);
    const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (!validFormats.includes(file.type)) {
      setUploadError('Invalid format: Retinal images must be in JPEG, PNG, or WebP format.');
      return;
    }

    const minSize = 10 * 1024; // 10 KB
    const maxSize = 15 * 1024 * 1024; // 15 MB
    if (file.size < minSize) {
      setUploadError('Image file too small: Please provide a clinical fundus photo (min 10KB).');
      return;
    }
    if (file.size > maxSize) {
      setUploadError('File size too large: Maximum supported upload is 15MB.');
      return;
    }

    setSelectedImageFile(file);
    setImageFileName(file.name);
    setImageSizeBytes(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    // Reset previous results
    setScreeningResult(null);
    setCompletedScreening(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetImage(e.target.files[0]);
    }
  };

  const handleSelectSampleImage = (sample: typeof SAMPLE_FUNDUS_IMAGES[0]) => {
    setUploadError(null);
    setPreviewUrl(sample.url);
    setImageFileName(sample.filename);
    setImageSizeBytes(450000);
    setSelectedImageFile(null);
    setScreeningResult(null);
    setCompletedScreening(null);
  };

  // Run AI Screening Pipeline
  const handleStartScreening = async () => {
    if (!selectedPatient) {
      setUploadError('Please select a patient before starting screening.');
      return;
    }
    if (!previewUrl) {
      setUploadError('Please upload or select a retinal fundus image.');
      return;
    }

    setIsAnalyzing(true);
    setUploadError(null);
    setScreeningResult(null);

    try {
      const output = await defaultAiService.analyzeRetina(
        {
          imageUrl: previewUrl,
          imageFilename: imageFileName,
          eyeSide,
          patientAge: selectedPatient.age,
          diabetesStatus: selectedPatient.diabetes_status,
          diabetesDurationYears: selectedPatient.duration_of_diabetes_years,
          bloodSugarMgDl: selectedPatient.blood_sugar_value,
        },
        (step) => {
          setPipelineSteps((prev) => {
            const next = [...prev];
            const idx = next.findIndex((s) => s.name === step.name);
            if (idx >= 0) next[idx] = step;
            else next.push(step);
            return next;
          });
        }
      );

      setScreeningResult(output);

      // Persist Screening Record into Database
      const { screening, result } = await createScreening(
        {
          patient_id: selectedPatient.id,
          eye_side: eyeSide,
          image_url: previewUrl,
          image_filename: imageFileName,
          image_size_bytes: imageSizeBytes,
          screened_by: currentUser?.id,
          health_camp_location: campLocation,
          notes: clinicalNotes,
        },
        {
          dr_stage: output.drStage,
          risk_category: output.riskCategory,
          confidence_score: output.confidenceScore,
          recommendation: output.recommendation,
          detected_features: output.detectedFeatures,
          raw_ai_response: output.rawAiResponse,
        }
      );

      const enriched: ScreeningWithDetails = {
        ...screening,
        patient: selectedPatient,
        result,
        screened_by_name: currentUser?.full_name || 'Community Health Worker',
      };
      setCompletedScreening(enriched);
      // Reload patient data to reflect new screening count
      loadPatients();
    } catch {
      setUploadError('AI screening pipeline encountered an error. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patient_id_code.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Medical Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Retinal Screening & AI Triage
            </h1>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
              Outreach Camp Protocol
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Capture or upload fundus photographs for automated diabetic retinopathy risk classification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/screenings')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <span>View Screening History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <MedicalDisclaimerBanner variant="prominent" />

      {/* Main 2-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Patient & Screening Setup (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Patient Selector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-700" />
                1. Select Camp Patient
              </span>
              <button
                type="button"
                onClick={() => onNavigate('/patients')}
                className="text-[11px] text-teal-700 hover:underline font-medium"
              >
                + Register New
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patient name or ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>

            {/* Patients Scroll Area */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredPatients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(p);
                      setScreeningResult(null);
                      setCompletedScreening(null);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50 border border-teal-300 text-teal-950 font-medium'
                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{p.full_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {p.patient_id_code} · {p.age}y · {p.diabetes_status.replace('_', ' ')}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Selected Patient Details Drawer */}
            {selectedPatient && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>{selectedPatient.full_name}</span>
                  <span className="font-mono text-slate-600">{selectedPatient.patient_id_code}</span>
                </div>
                <div className="text-slate-600 flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium text-slate-800">{selectedPatient.location}</span>
                </div>
                <div className="text-slate-600 flex justify-between">
                  <span>Diabetes History:</span>
                  <span className="font-medium text-slate-800">
                    {selectedPatient.duration_of_diabetes_years} yrs ({selectedPatient.diabetes_status})
                  </span>
                </div>
                {selectedPatient.blood_sugar_value && (
                  <div className="text-slate-600 flex justify-between">
                    <span>Blood Sugar / HbA1c:</span>
                    <span className="font-medium text-slate-800">
                      {selectedPatient.blood_sugar_value} mg/dL {selectedPatient.hba1c_percentage ? `· ${selectedPatient.hba1c_percentage}%` : ''}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Screening Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              2. Examination Parameters
            </span>

            {/* Eye Side Selection */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Eye Examined
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['both', 'right', 'left'] as EyeSide[]).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setEyeSide(side)}
                    className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-colors ${
                      eyeSide === side
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {side === 'both' ? 'Both Eyes' : side === 'right' ? 'OD (Right)' : 'OS (Left)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Camp Location */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Camp Location
              </label>
              <input
                type="text"
                value={campLocation}
                onChange={(e) => setCampLocation(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>

            {/* Clinical Observations */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Observations / Dilatation Notes
              </label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="e.g. Non-mydriatic capture; adequate pupil dilation; media clear"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Image Acquisition & AI Analysis (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Image Upload & Sample Selection Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-700" />
                3. Retinal Fundus Image Acquisition
              </span>
              <span className="text-[11px] text-slate-500">
                JPEG, PNG, WebP · Max 15MB
              </span>
            </div>

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-teal-50/30 flex flex-col items-center justify-center space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/tiff"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-teal-800">Click to upload fundus photo</span>
                <span className="text-slate-500"> or drag and drop</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Supports portable hand-held fundus cameras and desktop ophthalmic imagers
              </p>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Fast Clinical Demo Sample selector */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-600 block mb-2">
                Or select verified clinical fundus test scans for rapid testing:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_FUNDUS_IMAGES.map((sample, idx) => {
                  const isSampleActive = previewUrl === sample.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSampleImage(sample)}
                      className={`text-left p-2 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${
                        isSampleActive
                          ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{sample.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{sample.expectedStage}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fundus Preview Viewer */}
            {previewUrl && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Preview: {imageFileName || 'Selected Scan'}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {(imageSizeBytes / 1024).toFixed(0)} KB
                  </span>
                </div>

                <FundusViewer
                  imageUrl={previewUrl}
                  imageAlt={imageFileName}
                  eyeSide={eyeSide}
                  detectedFeatures={screeningResult?.detectedFeatures}
                  drStage={screeningResult?.drStage}
                  riskCategory={screeningResult?.riskCategory}
                />

                {/* Primary Action Button: Start Screening */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleStartScreening}
                    disabled={isAnalyzing}
                    className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-teal-200" />
                    <span>{isAnalyzing ? 'Analyzing Retinal Image...' : 'Start AI Screening'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pipeline Execution Animation Card */}
          {isAnalyzing && (
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  AI Screening Pipeline Executing...
                </h4>
              </div>
              <div className="space-y-2">
                {pipelineSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200">{step.name}</span>
                      <p className="text-[11px] text-slate-400 leading-snug">{step.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Screening Result Card */}
          {screeningResult && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
              {/* Result Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Screening Result
                    </span>
                    <span className="text-[11px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-mono font-semibold">
                      {screeningResult.isMockService ? 'CALIBRATED HEURISTIC' : 'PRE-TRAINED VISION AI'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Stored in screening_results)
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    {screeningResult.drStage}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Risk Classification</span>
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                      screeningResult.riskCategory === 'High'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : screeningResult.riskCategory === 'Moderate'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {screeningResult.riskCategory} Risk
                  </span>
                </div>
              </div>

              {/* Confidence & Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">AI Screening Confidence</span>
                  <span className="text-lg font-bold font-mono text-teal-800">
                    {(screeningResult.confidenceScore * 100).toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Anatomical quality: {screeningResult.anatomicalQuality}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Identified Microvascular Markers</span>
                  <span className="font-medium text-slate-900 block mt-1">
                    {screeningResult.detectedFeatures.slice(0, 3).join(' · ')}
                  </span>
                </div>
              </div>

              {/* Clinical Recommendation */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-teal-950 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-teal-700" />
                  Recommendation
                </div>
                <p className="text-teal-900 leading-relaxed font-medium">
                  {screeningResult.recommendation}
                </p>
              </div>

              {/* Mandatory Prominent Callout if High or Moderate Risk */}
              {screeningResult.riskCategory === 'High' && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-3">
                  <div className="flex items-start gap-2.5 text-rose-900">
                    <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-sm">
                        Further ophthalmological evaluation recommended.
                      </div>
                      <p className="mt-0.5 text-rose-800 leading-relaxed">
                        This patient shows high-risk retinal markers. Immediate referral to the District Ophthalmology Hospital is advised for dilated examination.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setReferralModalOpen(true)}
                      className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <SendHorizontal className="w-4 h-4" />
                      <span>Create Hospital Referral</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons: View Full Report & Referral */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Screening record saved to database</span>
                </div>

                <div className="flex items-center gap-2">
                  {completedScreening && (
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate Printable Report</span>
                    </button>
                  )}

                  {screeningResult.riskCategory !== 'High' && (
                    <button
                      type="button"
                      onClick={() => setReferralModalOpen(true)}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <SendHorizontal className="w-4 h-4" />
                      <span>Refer Patient</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Modal */}
      {selectedPatient && completedScreening && (
        <CreateReferralModal
          isOpen={referralModalOpen}
          onClose={() => setReferralModalOpen(false)}
          screening={completedScreening}
          patient={selectedPatient}
          screeningResult={completedScreening.result}
          onReferralCreated={() => {
            // refresh data
            loadPatients();
          }}
        />
      )}

      {/* Screening Report Modal */}
      {completedScreening && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          screening={completedScreening}
          onCreateReferral={() => {
            setReportModalOpen(false);
            setReferralModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
