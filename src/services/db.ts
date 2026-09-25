import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  AppNotification,
  CareLevel,
  DiabetesStatus,
  DRStage,
  EyeSide,
  Gender,
  Patient,
  PatientWithHistory,
  Referral,
  ReferralStatus,
  ReferralWithDetails,
  RiskCategory,
  Screening,
  ScreeningResult,
  ScreeningWithDetails,
  UrgencyLevel,
  UserProfile,
} from '../types';

const NORMAL_FUNDUS_IMG = '/src/assets/images/retinal_fundus_normal_1790314825100.jpg';
const MILD_DR_IMG = '/src/assets/images/retinal_fundus_mild_dr_1790314839921.jpg';
const SEVERE_DR_IMG = '/src/assets/images/retinal_fundus_severe_dr_1790314850916.jpg';

export const SAMPLE_FUNDUS_IMAGES = [
  {
    name: 'Clinical Normal Retina (OD)',
    url: NORMAL_FUNDUS_IMG,
    filename: 'sample_normal_retina_od.jpg',
    expectedStage: 'No DR' as DRStage,
    expectedRisk: 'Low' as RiskCategory,
    description: 'Optic disc margin sharp, no microaneurysms, macula intact.',
  },
  {
    name: 'Clinical Mild DR (OS)',
    url: MILD_DR_IMG,
    filename: 'sample_mild_dr_os.jpg',
    expectedStage: 'Mild DR' as DRStage,
    expectedRisk: 'Low' as RiskCategory,
    description: 'Isolated microaneurysms present, no hard exudates near fovea.',
  },
  {
    name: 'Clinical Severe Non-Proliferative DR (OD)',
    url: SEVERE_DR_IMG,
    filename: 'sample_severe_dr_od.jpg',
    expectedStage: 'Severe DR' as DRStage,
    expectedRisk: 'High' as RiskCategory,
    description: 'Extensive intraretinal hemorrhages, hard exudates encircling macula.',
  },
];

// Seed Data for initial demonstration
export const SEED_PROFILES: UserProfile[] = [
  {
    id: 'prof-001',
    user_id: 'user-hw-001',
    email: 'priya.sharma@healthcamp.org',
    full_name: 'Priya Sharma (ASHA / Health Worker)',
    role: 'health_worker',
    phone: '+91 98450 12345',
    health_center_name: 'Dharampur Primary Health Camp',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
  {
    id: 'prof-002',
    user_id: 'user-doc-002',
    email: 'dr.ramanath@ophthalmology.org',
    full_name: 'Dr. S. Ramanath, MS (Ophthalmology)',
    role: 'doctor',
    phone: '+91 94480 67890',
    health_center_name: 'District Eye Care Hospital',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
  {
    id: 'prof-003',
    user_id: 'user-adm-003',
    email: 'admin@retinareach.org',
    full_name: 'Admin - Health Camp Coordinator',
    role: 'admin',
    phone: '+91 91234 56789',
    health_center_name: 'National Rural Eye Health Directorate',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-08-01T09:00:00Z',
  },
];

export const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    patient_id_code: 'RR-2026-0041',
    full_name: 'Sunita Sharma',
    age: 58,
    gender: 'female',
    phone: '+91 98765 43210',
    location: 'Dharampur Primary Health Post',
    diabetes_status: 'type_2',
    duration_of_diabetes_years: 12,
    blood_sugar_value: 218,
    hba1c_percentage: 8.9,
    additional_notes: 'Reports frequent morning blurry vision and floating spots. Irregular metformin compliance.',
    created_by: 'prof-001',
    created_at: '2026-09-10T10:15:00Z',
    updated_at: '2026-09-10T10:15:00Z',
  },
  {
    id: 'pat-002',
    patient_id_code: 'RR-2026-0038',
    full_name: 'Kavitha Devi',
    age: 52,
    gender: 'female',
    phone: '+91 98451 22334',
    location: 'Sundarban Mobile Outreach Camp',
    diabetes_status: 'type_2',
    duration_of_diabetes_years: 6,
    blood_sugar_value: 164,
    hba1c_percentage: 7.4,
    additional_notes: 'Mild eye strain during needlework. Last general clinic check 8 months ago.',
    created_by: 'prof-001',
    created_at: '2026-09-14T11:30:00Z',
    updated_at: '2026-09-14T11:30:00Z',
  },
  {
    id: 'pat-003',
    patient_id_code: 'RR-2026-0029',
    full_name: 'Rajesh Kumar',
    age: 46,
    gender: 'male',
    phone: '+91 97654 32109',
    location: 'Bilaspur Rural Outreach Unit',
    diabetes_status: 'prediabetes',
    duration_of_diabetes_years: 1.5,
    blood_sugar_value: 128,
    hba1c_percentage: 5.9,
    additional_notes: 'Attended camp for routine baseline eye check. No visual complaints.',
    created_by: 'prof-001',
    created_at: '2026-09-18T09:45:00Z',
    updated_at: '2026-09-18T09:45:00Z',
  },
  {
    id: 'pat-004',
    patient_id_code: 'RR-2026-0015',
    full_name: 'Anand Patel',
    age: 63,
    gender: 'male',
    phone: '+91 94231 77889',
    location: 'Dharampur Primary Health Post',
    diabetes_status: 'type_2',
    duration_of_diabetes_years: 14,
    blood_sugar_value: 195,
    hba1c_percentage: 8.2,
    additional_notes: 'Hypertension co-morbidity. Taking amlodipine and glimepiride.',
    created_by: 'prof-001',
    created_at: '2026-09-20T14:10:00Z',
    updated_at: '2026-09-20T14:10:00Z',
  },
  {
    id: 'pat-005',
    patient_id_code: 'RR-2026-0050',
    full_name: 'Meena Begum',
    age: 60,
    gender: 'female',
    phone: '+91 93120 44556',
    location: 'Sundarban Mobile Outreach Camp',
    diabetes_status: 'type_2',
    duration_of_diabetes_years: 8,
    blood_sugar_value: 180,
    hba1c_percentage: 7.8,
    additional_notes: 'Newly enrolled patient in today’s camp roster. Awaiting initial screening.',
    created_by: 'prof-001',
    created_at: '2026-09-24T08:30:00Z',
    updated_at: '2026-09-24T08:30:00Z',
  },
];

export const SEED_SCREENINGS: Screening[] = [
  {
    id: 'scr-001',
    patient_id: 'pat-001',
    eye_side: 'both',
    image_url: SEVERE_DR_IMG,
    image_filename: 'sunita_sharma_fundus_od.jpg',
    image_size_bytes: 482104,
    image_resolution: '1920x1440',
    status: 'completed',
    screened_by: 'prof-001',
    health_camp_location: 'Dharampur Primary Health Post',
    notes: 'Pupil dilated adequately with 0.5% tropicamide. Clear media.',
    created_at: '2026-09-10T10:35:00Z',
  },
  {
    id: 'scr-002',
    patient_id: 'pat-002',
    eye_side: 'both',
    image_url: MILD_DR_IMG,
    image_filename: 'kavitha_devi_fundus_os.jpg',
    image_size_bytes: 412030,
    image_resolution: '1920x1440',
    status: 'completed',
    screened_by: 'prof-001',
    health_camp_location: 'Sundarban Mobile Outreach Camp',
    notes: 'Non-mydriatic portable hand-held fundus camera capture.',
    created_at: '2026-09-14T11:50:00Z',
  },
  {
    id: 'scr-003',
    patient_id: 'pat-003',
    eye_side: 'right',
    image_url: NORMAL_FUNDUS_IMG,
    image_filename: 'rajesh_kumar_fundus_od.jpg',
    image_size_bytes: 395120,
    image_resolution: '1920x1440',
    status: 'completed',
    screened_by: 'prof-001',
    health_camp_location: 'Bilaspur Rural Outreach Unit',
    notes: 'High quality optical scan, patient cooperative.',
    created_at: '2026-09-18T10:05:00Z',
  },
  {
    id: 'scr-004',
    patient_id: 'pat-004',
    eye_side: 'left',
    image_url: MILD_DR_IMG,
    image_filename: 'anand_patel_fundus_os.jpg',
    image_size_bytes: 405900,
    image_resolution: '1920x1440',
    status: 'completed',
    screened_by: 'prof-001',
    health_camp_location: 'Dharampur Primary Health Post',
    notes: 'Slight anterior cortical cataract observed.',
    created_at: '2026-09-20T14:35:00Z',
  },
];

export const SEED_SCREENING_RESULTS: ScreeningResult[] = [
  {
    id: 'res-001',
    screening_id: 'scr-001',
    dr_stage: 'Severe DR',
    risk_category: 'High',
    confidence_score: 0.928,
    recommendation: 'Further ophthalmological evaluation recommended urgently within 2 to 4 weeks. High risk of progression.',
    detected_features: [
      'Multiple intraretinal blot hemorrhages',
      'Hard exudates encroaching macula',
      'Venous beading',
      'Focal cotton-wool spots',
    ],
    is_mock_service: false,
    reviewed_by_doctor: true,
    doctor_notes: 'Reviewed by Dr. Ramanath: Concur with high-risk classification. Fast-track referral to District Hospital Ophthalmology.',
    reviewed_by_doctor_id: 'prof-002',
    reviewed_by_doctor_name: 'Dr. S. Ramanath, MS',
    reviewed_at: '2026-09-10T11:00:00Z',
    created_at: '2026-09-10T10:36:00Z',
  },
  {
    id: 'res-002',
    screening_id: 'scr-002',
    dr_stage: 'Moderate DR',
    risk_category: 'Moderate',
    confidence_score: 0.884,
    recommendation: 'Further ophthalmological evaluation recommended within 2 to 3 months. Emphasize glycemic control and blood pressure regulation.',
    detected_features: [
      'Scattered microaneurysms in upper temporal arcade',
      'Dot hemorrhages',
      'Early macular thickening risk',
    ],
    is_mock_service: false,
    reviewed_by_doctor: false,
    created_at: '2026-09-14T11:51:00Z',
  },
  {
    id: 'res-003',
    screening_id: 'scr-003',
    dr_stage: 'No DR',
    risk_category: 'Low',
    confidence_score: 0.956,
    recommendation: 'No diabetic retinopathy signs detected. Annual regular screening recommended at the next community health camp.',
    detected_features: [
      'Normal optical disc margins',
      'Clear foveal avascular zone',
      'No retinal microvascular lesions',
    ],
    is_mock_service: false,
    reviewed_by_doctor: true,
    doctor_notes: 'Baseline healthy retina. Safe for standard 12-month community re-screen.',
    reviewed_by_doctor_id: 'prof-002',
    reviewed_by_doctor_name: 'Dr. S. Ramanath, MS',
    reviewed_at: '2026-09-18T10:20:00Z',
    created_at: '2026-09-18T10:06:00Z',
  },
  {
    id: 'res-004',
    screening_id: 'scr-004',
    dr_stage: 'Mild DR',
    risk_category: 'Low',
    confidence_score: 0.912,
    recommendation: 'Mild non-proliferative microaneurysms noted. Follow-up screening in 6 to 12 months with routine diabetic care.',
    detected_features: ['Isolated microaneurysms (< 5)', 'Clear macula'],
    is_mock_service: false,
    reviewed_by_doctor: false,
    created_at: '2026-09-20T14:36:00Z',
  },
];

export const SEED_REFERRALS: Referral[] = [
  {
    id: 'ref-001',
    screening_id: 'scr-001',
    patient_id: 'pat-001',
    reason: 'AI screening flagged Severe DR with macular exudates. Confirmed high-risk requiring optical coherence tomography (OCT) and dilated slit-lamp fundus biomicroscopy.',
    recommended_care_level: 'district_hospital',
    urgency: 'immediate',
    referral_status: 'scheduled',
    target_facility: 'District Eye Care Hospital, Ophthalmology OPD-3',
    notes: 'Transportation voucher issued by camp coordinator. Appointment booked for Sept 28, 2026 with Dr. Ramanath.',
    referred_by: 'prof-001',
    referral_date: '2026-09-10',
    appointment_date: '2026-09-28',
    created_at: '2026-09-10T10:45:00Z',
    updated_at: '2026-09-11T09:00:00Z',
  },
  {
    id: 'ref-002',
    screening_id: 'scr-002',
    patient_id: 'pat-002',
    reason: 'Moderate non-proliferative diabetic retinopathy detected. Risk of progression without glycemic stabilization and clinical review.',
    recommended_care_level: 'primary_clinic',
    urgency: 'within_30_days',
    referral_status: 'pending',
    target_facility: 'Sundarban Sub-Divisional Hospital Ophthalmology Unit',
    notes: 'Awaiting patient confirmation of travel date with village ASHA worker.',
    referred_by: 'prof-001',
    referral_date: '2026-09-14',
    created_at: '2026-09-14T12:00:00Z',
    updated_at: '2026-09-14T12:00:00Z',
  },
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    recipient_role: 'health_worker',
    type: 'high_risk_screening',
    title: 'Urgent: High Risk DR Detected',
    message: 'Patient Sunita Sharma (RR-2026-0041) classified as High Risk (Severe DR). Immediate ophthalmologist referral recommended.',
    patient_id: 'pat-001',
    patient_name: 'Sunita Sharma',
    screening_id: 'scr-001',
    risk_category: 'High',
    dr_stage: 'Severe DR',
    read: false,
    created_at: '2026-09-10T10:36:00Z',
  },
  {
    id: 'notif-002',
    recipient_role: 'health_worker',
    type: 'referral_updated',
    title: 'Referral Status Updated: Scheduled',
    message: 'Dr. S. Ramanath scheduled referral for Sunita Sharma at District Eye Care Hospital on Sept 28, 2026.',
    patient_id: 'pat-001',
    patient_name: 'Sunita Sharma',
    referral_id: 'ref-001',
    read: false,
    created_at: '2026-09-11T09:00:00Z',
  },
];

const STORAGE_KEYS = {
  PROFILES: 'retinareach_profiles_v2',
  PATIENTS: 'retinareach_patients_v2',
  SCREENINGS: 'retinareach_screenings_v2',
  RESULTS: 'retinareach_results_v2',
  REFERRALS: 'retinareach_referrals_v2',
  NOTIFICATIONS: 'retinareach_notifications_v2',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

let hasInitializedFirebase = false;

// Initialize default seed data into Firestore and localStorage
export async function initDatabase(): Promise<void> {
  // Always initialize local cache
  if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) setStored(STORAGE_KEYS.PROFILES, SEED_PROFILES);
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) setStored(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  if (!localStorage.getItem(STORAGE_KEYS.SCREENINGS)) setStored(STORAGE_KEYS.SCREENINGS, SEED_SCREENINGS);
  if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) setStored(STORAGE_KEYS.RESULTS, SEED_SCREENING_RESULTS);
  if (!localStorage.getItem(STORAGE_KEYS.REFERRALS)) setStored(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) setStored(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);

  if (hasInitializedFirebase || !isFirebaseConfigured) return;

  try {
    // Check if patients collection has documents; if not, seed Firestore
    const patientSnap = await getDocs(collection(db, 'patients'));
    if (patientSnap.empty) {
      for (const p of SEED_PATIENTS) {
        await setDoc(doc(db, 'patients', p.id), p);
      }
      for (const s of SEED_SCREENINGS) {
        await setDoc(doc(db, 'screenings', s.id), s);
      }
      for (const r of SEED_SCREENING_RESULTS) {
        await setDoc(doc(db, 'screening_results', r.id), r);
      }
      for (const ref of SEED_REFERRALS) {
        await setDoc(doc(db, 'referrals', ref.id), ref);
      }
      for (const n of SEED_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', n.id), n);
      }
      for (const u of SEED_PROFILES) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    }
    hasInitializedFirebase = true;
  } catch (err) {
    console.warn('Firestore seeding skipped or using offline cache:', err);
  }
}

// -----------------------------------------------------------------------------
// PATIENTS API
// -----------------------------------------------------------------------------

export async function getPatients(
  searchQuery?: string,
  screeningFilter?: string,
  diabetesFilter?: string
): Promise<PatientWithHistory[]> {
  await initDatabase();
  let patients: Patient[] = [];

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'patients'));
      if (!snap.empty) {
        patients = snap.docs.map((d) => d.data() as Patient);
        setStored(STORAGE_KEYS.PATIENTS, patients);
      } else {
        patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
      }
    } catch {
      patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
    }
  } else {
    patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  }

  const screenings = getStored<Screening[]>(STORAGE_KEYS.SCREENINGS, SEED_SCREENINGS);
  const results = getStored<ScreeningResult[]>(STORAGE_KEYS.RESULTS, SEED_SCREENING_RESULTS);
  const referrals = getStored<Referral[]>(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);

  let enriched: PatientWithHistory[] = patients.map((pat) => {
    const patScreenings = screenings.filter((s) => s.patient_id === pat.id);
    const latestScreening = patScreenings.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    const result = latestScreening
      ? results.find((r) => r.screening_id === latestScreening.id)
      : undefined;

    const activeRef = referrals.find(
      (ref) => ref.patient_id === pat.id && ref.referral_status !== 'cancelled'
    );

    return {
      ...pat,
      screenings_count: patScreenings.length,
      latest_screening: latestScreening ? { ...latestScreening, result } : undefined,
      active_referral: activeRef,
    };
  });

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    enriched = enriched.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.patient_id_code.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }

  if (diabetesFilter && diabetesFilter !== 'all') {
    enriched = enriched.filter((p) => p.diabetes_status === diabetesFilter);
  }

  if (screeningFilter && screeningFilter !== 'all') {
    if (screeningFilter === 'screened') {
      enriched = enriched.filter((p) => p.screenings_count > 0);
    } else if (screeningFilter === 'unscreened') {
      enriched = enriched.filter((p) => p.screenings_count === 0);
    } else if (screeningFilter === 'high_risk') {
      enriched = enriched.filter((p) => (p.latest_screening?.result?.doctor_override_risk || p.latest_screening?.result?.risk_category) === 'High');
    } else if (screeningFilter === 'referred') {
      enriched = enriched.filter((p) => Boolean(p.active_referral));
    }
  }

  return enriched;
}

export async function createPatient(data: {
  full_name: string;
  age: number;
  gender: Gender;
  phone: string;
  location: string;
  diabetes_status: DiabetesStatus;
  duration_of_diabetes_years: number;
  blood_sugar_value?: number;
  hba1c_percentage?: number;
  additional_notes?: string;
  created_by?: string;
}): Promise<Patient> {
  const existing = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  const nextSeq = existing.length + 42;
  const patient_id_code = `RR-2026-${String(nextSeq).padStart(4, '0')}`;
  const now = new Date().toISOString();

  const newPatient: Patient = {
    id: `pat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    patient_id_code,
    full_name: data.full_name.trim(),
    age: Number(data.age),
    gender: data.gender,
    phone: data.phone.trim(),
    location: data.location.trim(),
    diabetes_status: data.diabetes_status,
    duration_of_diabetes_years: Number(data.duration_of_diabetes_years || 0),
    blood_sugar_value: data.blood_sugar_value ? Number(data.blood_sugar_value) : undefined,
    hba1c_percentage: data.hba1c_percentage ? Number(data.hba1c_percentage) : undefined,
    additional_notes: data.additional_notes?.trim() || '',
    created_by: data.created_by || 'prof-001',
    created_at: now,
    updated_at: now,
  };

  const updated = [newPatient, ...existing];
  setStored(STORAGE_KEYS.PATIENTS, updated);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'patients', newPatient.id), newPatient);
    } catch (err) {
      console.warn('Firestore patient write skipped, stored in cache:', err);
    }
  }

  return newPatient;
}

// -----------------------------------------------------------------------------
// SCREENINGS & AI SCREENING RESULTS API
// -----------------------------------------------------------------------------

export async function getScreenings(patientId?: string): Promise<ScreeningWithDetails[]> {
  await initDatabase();
  let screenings = getStored<Screening[]>(STORAGE_KEYS.SCREENINGS, SEED_SCREENINGS);
  let results = getStored<ScreeningResult[]>(STORAGE_KEYS.RESULTS, SEED_SCREENING_RESULTS);
  let referrals = getStored<Referral[]>(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);
  let patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  const profiles = getStored<UserProfile[]>(STORAGE_KEYS.PROFILES, SEED_PROFILES);

  if (isFirebaseConfigured) {
    try {
      const [scrSnap, resSnap, refSnap] = await Promise.all([
        getDocs(collection(db, 'screenings')),
        getDocs(collection(db, 'screening_results')),
        getDocs(collection(db, 'referrals')),
      ]);
      if (!scrSnap.empty) {
        screenings = scrSnap.docs.map((d) => d.data() as Screening);
        setStored(STORAGE_KEYS.SCREENINGS, screenings);
      }
      if (!resSnap.empty) {
        results = resSnap.docs.map((d) => d.data() as ScreeningResult);
        setStored(STORAGE_KEYS.RESULTS, results);
      }
      if (!refSnap.empty) {
        referrals = refSnap.docs.map((d) => d.data() as Referral);
        setStored(STORAGE_KEYS.REFERRALS, referrals);
      }
    } catch {
      // Continue with local cache
    }
  }

  let filtered = screenings;
  if (patientId) {
    filtered = filtered.filter((s) => s.patient_id === patientId);
  }

  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return filtered.map((s) => {
    const patient = patients.find((p) => p.id === s.patient_id);
    const result = results.find((r) => r.screening_id === s.id);
    const referral = referrals.find((ref) => ref.screening_id === s.id);
    const screener = profiles.find((pr) => pr.id === s.screened_by);

    return {
      ...s,
      patient,
      result,
      referral,
      screened_by_name: screener?.full_name || 'Community Health Worker',
    };
  });
}

export async function createScreening(
  screeningInput: {
    patient_id: string;
    eye_side: EyeSide;
    image_url: string;
    image_filename: string;
    image_size_bytes: number;
    image_resolution?: string;
    screened_by?: string;
    health_camp_location: string;
    notes?: string;
  },
  aiResultInput: {
    dr_stage: DRStage;
    risk_category: RiskCategory;
    confidence_score: number;
    recommendation: string;
    detected_features: string[];
    raw_ai_response?: Record<string, unknown>;
  }
): Promise<{ screening: Screening; result: ScreeningResult }> {
  const now = new Date().toISOString();
  const screeningId = `scr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const resultId = `res-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const newScreening: Screening = {
    id: screeningId,
    patient_id: screeningInput.patient_id,
    eye_side: screeningInput.eye_side,
    image_url: screeningInput.image_url,
    image_filename: screeningInput.image_filename,
    image_size_bytes: screeningInput.image_size_bytes,
    image_resolution: screeningInput.image_resolution || '1920x1440',
    status: 'completed',
    screened_by: screeningInput.screened_by || 'prof-001',
    health_camp_location: screeningInput.health_camp_location,
    notes: screeningInput.notes,
    created_at: now,
  };

  const newResult: ScreeningResult = {
    id: resultId,
    screening_id: screeningId,
    dr_stage: aiResultInput.dr_stage,
    risk_category: aiResultInput.risk_category,
    confidence_score: aiResultInput.confidence_score,
    recommendation: aiResultInput.recommendation,
    detected_features: aiResultInput.detected_features,
    raw_ai_response: aiResultInput.raw_ai_response,
    is_mock_service: false,
    reviewed_by_doctor: false,
    created_at: now,
  };

  const existingScreenings = getStored<Screening[]>(STORAGE_KEYS.SCREENINGS, SEED_SCREENINGS);
  const existingResults = getStored<ScreeningResult[]>(STORAGE_KEYS.RESULTS, SEED_SCREENING_RESULTS);

  setStored(STORAGE_KEYS.SCREENINGS, [newScreening, ...existingScreenings]);
  setStored(STORAGE_KEYS.RESULTS, [newResult, ...existingResults]);

  // Persist to Firestore: store both screening and screening_results table
  if (isFirebaseConfigured) {
    try {
      await Promise.all([
        setDoc(doc(db, 'screenings', newScreening.id), newScreening),
        setDoc(doc(db, 'screening_results', newResult.id), newResult),
      ]);
    } catch (err) {
      console.warn('Firestore screening write error:', err);
    }
  }

  // Real-time alert: If High Risk, immediately trigger alert for health workers
  if (aiResultInput.risk_category === 'High') {
    const patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
    const pat = patients.find((p) => p.id === screeningInput.patient_id);
    const patientName = pat?.full_name || 'Patient';

    await createNotification({
      recipient_role: 'health_worker',
      type: 'high_risk_screening',
      title: '🚨 High Risk DR Triage Alert',
      message: `Patient ${patientName} screened as High Risk (${aiResultInput.dr_stage}). Prompt specialist referral required.`,
      patient_id: screeningInput.patient_id,
      patient_name: patientName,
      screening_id: screeningId,
      risk_category: 'High',
      dr_stage: aiResultInput.dr_stage,
    });
  }

  return { screening: newScreening, result: newResult };
}

// -----------------------------------------------------------------------------
// DOCTOR CLINICAL REVIEW & OVERRIDE API
// -----------------------------------------------------------------------------

export async function submitDoctorReview(data: {
  screeningId: string;
  doctorNotes: string;
  doctorId: string;
  doctorName: string;
  overrideRisk?: RiskCategory;
  overrideStage?: DRStage;
  overrideReason?: string;
  newReferralStatus?: ReferralStatus;
  urgency?: UrgencyLevel;
  targetFacility?: string;
}): Promise<{ result: ScreeningResult; referral?: Referral }> {
  const results = getStored<ScreeningResult[]>(STORAGE_KEYS.RESULTS, SEED_SCREENING_RESULTS);
  const resultIdx = results.findIndex((r) => r.screening_id === data.screeningId);
  if (resultIdx === -1) {
    throw new Error('Screening result record not found');
  }

  const now = new Date().toISOString();
  const currentResult = results[resultIdx];

  const updatedResult: ScreeningResult = {
    ...currentResult,
    reviewed_by_doctor: true,
    doctor_notes: data.doctorNotes.trim(),
    reviewed_by_doctor_id: data.doctorId,
    reviewed_by_doctor_name: data.doctorName,
    reviewed_at: now,
    doctor_override_risk: data.overrideRisk,
    doctor_override_stage: data.overrideStage,
    doctor_override_reason: data.overrideReason?.trim(),
  };

  results[resultIdx] = updatedResult;
  setStored(STORAGE_KEYS.RESULTS, results);

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'screening_results', updatedResult.id), {
        reviewed_by_doctor: true,
        doctor_notes: updatedResult.doctor_notes,
        reviewed_by_doctor_id: updatedResult.reviewed_by_doctor_id,
        reviewed_by_doctor_name: updatedResult.reviewed_by_doctor_name,
        reviewed_at: updatedResult.reviewed_at,
        doctor_override_risk: updatedResult.doctor_override_risk || null,
        doctor_override_stage: updatedResult.doctor_override_stage || null,
        doctor_override_reason: updatedResult.doctor_override_reason || null,
      });
    } catch (err) {
      console.warn('Firestore result update error:', err);
    }
  }

  // Handle Referral creation or update if requested by doctor
  let referral: Referral | undefined;
  const screenings = getStored<Screening[]>(STORAGE_KEYS.SCREENINGS, SEED_SCREENINGS);
  const screening = screenings.find((s) => s.id === data.screeningId);
  const patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  const patient = screening ? patients.find((p) => p.id === screening.patient_id) : undefined;
  const patientName = patient?.full_name || 'Patient';

  const effectiveRisk = updatedResult.doctor_override_risk || updatedResult.risk_category;
  const referrals = getStored<Referral[]>(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);
  const existingRefIdx = referrals.findIndex((r) => r.screening_id === data.screeningId);

  if (existingRefIdx >= 0) {
    const existingRef = referrals[existingRefIdx];
    const newStatus = data.newReferralStatus || existingRef.referral_status;
    referrals[existingRefIdx] = {
      ...existingRef,
      referral_status: newStatus,
      target_facility: data.targetFacility || existingRef.target_facility,
      notes: `${existingRef.notes || ''}\n[Doctor Assessment]: ${data.doctorNotes}`.trim(),
      updated_at: now,
    };
    referral = referrals[existingRefIdx];
    setStored(STORAGE_KEYS.REFERRALS, referrals);

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'referrals', referral.id), {
          referral_status: referral.referral_status,
          target_facility: referral.target_facility,
          notes: referral.notes,
          updated_at: referral.updated_at,
        });
      } catch (err) {
        console.warn('Firestore referral update error:', err);
      }
    }

    // Trigger Real-time notification to Health Workers on referral update
    await createNotification({
      recipient_role: 'health_worker',
      type: 'referral_updated',
      title: `Referral Status Updated: ${newStatus.toUpperCase()}`,
      message: `${data.doctorName} reviewed and updated referral status for ${patientName} to "${newStatus}".`,
      patient_id: screening?.patient_id,
      patient_name: patientName,
      screening_id: data.screeningId,
      referral_id: referral.id,
      risk_category: effectiveRisk,
    });
  } else if (effectiveRisk === 'High' || data.newReferralStatus) {
    // Create new referral if not existing and patient is High Risk or doctor initiated
    const newRef: Referral = {
      id: `ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      screening_id: data.screeningId,
      patient_id: screening?.patient_id || '',
      reason: data.doctorNotes || `Doctor assessment confirmed ${effectiveRisk} risk Diabetic Retinopathy.`,
      recommended_care_level: 'district_hospital',
      urgency: data.urgency || (effectiveRisk === 'High' ? 'immediate' : 'within_30_days'),
      referral_status: data.newReferralStatus || 'scheduled',
      target_facility: data.targetFacility || 'District Eye Care Hospital - Retina Clinic',
      notes: data.overrideReason ? `Doctor Override: ${data.overrideReason}` : undefined,
      referred_by: data.doctorId,
      referral_date: now.split('T')[0],
      created_at: now,
      updated_at: now,
    };

    referrals.unshift(newRef);
    setStored(STORAGE_KEYS.REFERRALS, referrals);
    referral = newRef;

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'referrals', newRef.id), newRef);
      } catch (err) {
        console.warn('Firestore referral write error:', err);
      }
    }

    // Trigger Real-time notification for Health Worker
    await createNotification({
      recipient_role: 'health_worker',
      type: 'referral_updated',
      title: 'Specialist Referral Initiated',
      message: `${data.doctorName} established referral for ${patientName} to ${newRef.target_facility}.`,
      patient_id: screening?.patient_id,
      patient_name: patientName,
      screening_id: data.screeningId,
      referral_id: newRef.id,
      risk_category: effectiveRisk,
    });
  } else {
    // Just a doctor review notification
    await createNotification({
      recipient_role: 'health_worker',
      type: 'doctor_review',
      title: 'Doctor Clinical Review Completed',
      message: `${data.doctorName} evaluated screening for ${patientName}${data.overrideRisk ? ` (Override to ${data.overrideRisk} Risk)` : ''}.`,
      patient_id: screening?.patient_id,
      patient_name: patientName,
      screening_id: data.screeningId,
      risk_category: effectiveRisk,
    });
  }

  return { result: updatedResult, referral };
}

// -----------------------------------------------------------------------------
// REFERRALS API
// -----------------------------------------------------------------------------

export async function getReferrals(statusFilter?: ReferralStatus | 'all'): Promise<ReferralWithDetails[]> {
  await initDatabase();
  let referrals = getStored<Referral[]>(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);
  const patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  const screenings = getStored<Screening[]>(STORAGE_KEYS.SCREENINGS, SEED_SCREENINGS);
  const results = getStored<ScreeningResult[]>(STORAGE_KEYS.RESULTS, SEED_SCREENING_RESULTS);

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'referrals'));
      if (!snap.empty) {
        referrals = snap.docs.map((d) => d.data() as Referral);
        setStored(STORAGE_KEYS.REFERRALS, referrals);
      }
    } catch {
      // Use cache
    }
  }

  let filtered = referrals;
  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((r) => r.referral_status === statusFilter);
  }

  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return filtered.map((ref) => {
    const patient = patients.find((p) => p.id === ref.patient_id);
    const screening = screenings.find((s) => s.id === ref.screening_id);
    const result = screening ? results.find((r) => r.screening_id === screening.id) : undefined;

    return {
      ...ref,
      patient,
      screening,
      screening_result: result,
    };
  });
}

export async function createReferral(data: {
  screening_id: string;
  patient_id: string;
  reason: string;
  recommended_care_level: CareLevel;
  urgency: UrgencyLevel;
  target_facility: string;
  notes?: string;
  referred_by?: string;
  appointment_date?: string;
}): Promise<Referral> {
  const now = new Date().toISOString();
  const newRef: Referral = {
    id: `ref-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    screening_id: data.screening_id,
    patient_id: data.patient_id,
    reason: data.reason.trim(),
    recommended_care_level: data.recommended_care_level,
    urgency: data.urgency,
    referral_status: 'pending',
    target_facility: data.target_facility.trim(),
    notes: data.notes?.trim(),
    referred_by: data.referred_by || 'prof-001',
    referral_date: now.split('T')[0],
    appointment_date: data.appointment_date,
    created_at: now,
    updated_at: now,
  };

  const existing = getStored<Referral[]>(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);
  setStored(STORAGE_KEYS.REFERRALS, [newRef, ...existing]);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'referrals', newRef.id), newRef);
    } catch (err) {
      console.warn('Firestore referral write skipped:', err);
    }
  }

  const patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  const patient = patients.find((p) => p.id === data.patient_id);

  // Notify Doctor and Reviewers about newly issued referral
  await createNotification({
    recipient_role: 'doctor',
    type: 'referral_updated',
    title: 'New Hospital Referral Issued',
    message: `Outreach camp staff referred ${patient?.full_name || 'Patient'} to ${data.target_facility}.`,
    patient_id: data.patient_id,
    patient_name: patient?.full_name,
    screening_id: data.screening_id,
    referral_id: newRef.id,
  });

  return newRef;
}

export async function updateReferralStatus(
  id: string,
  newStatus: ReferralStatus,
  doctorNotes?: string,
  updatedByDoctorName: string = 'Doctor'
): Promise<Referral | null> {
  const referrals = getStored<Referral[]>(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);
  const idx = referrals.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  referrals[idx] = {
    ...referrals[idx],
    referral_status: newStatus,
    notes: doctorNotes
      ? `${referrals[idx].notes || ''}\n[Status update to ${newStatus}]: ${doctorNotes}`.trim()
      : referrals[idx].notes,
    updated_at: now,
  };

  setStored(STORAGE_KEYS.REFERRALS, referrals);

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'referrals', id), {
        referral_status: newStatus,
        notes: referrals[idx].notes,
        updated_at: now,
      });
    } catch (err) {
      console.warn('Firestore referral status update error:', err);
    }
  }

  const patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  const patient = patients.find((p) => p.id === referrals[idx].patient_id);

  // Trigger Real-time notification for Health Workers!
  await createNotification({
    recipient_role: 'health_worker',
    type: 'referral_updated',
    title: `Referral Status Changed: ${newStatus.toUpperCase()}`,
    message: `${updatedByDoctorName} updated referral for ${patient?.full_name || 'Patient'} to ${newStatus}.`,
    patient_id: referrals[idx].patient_id,
    patient_name: patient?.full_name,
    referral_id: id,
    screening_id: referrals[idx].screening_id,
  });

  return referrals[idx];
}

// -----------------------------------------------------------------------------
// REAL-TIME NOTIFICATIONS API
// -----------------------------------------------------------------------------

export async function getNotifications(): Promise<AppNotification[]> {
  await initDatabase();
  let notifs = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);

  if (isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      if (!snap.empty) {
        notifs = snap.docs.map((d) => d.data() as AppNotification);
        setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
      }
    } catch {
      // Use cache
    }
  }

  return notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createNotification(data: Omit<AppNotification, 'id' | 'read' | 'created_at'>): Promise<AppNotification> {
  const notif: AppNotification = {
    ...data,
    id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    read: false,
    created_at: new Date().toISOString(),
  };

  const existing = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const updated = [notif, ...existing];
  setStored(STORAGE_KEYS.NOTIFICATIONS, updated);

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
    } catch (err) {
      console.warn('Firestore notification write skipped:', err);
    }
  }

  // Dispatch custom window event for in-page immediate reactive update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('retinareach_notification', { detail: notif }));
  }

  return notif;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const existing = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const updated = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
  setStored(STORAGE_KEYS.NOTIFICATIONS, updated);

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch {
      // Ignore
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('retinareach_notification_read', { detail: { id } }));
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const existing = getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  const updated = existing.map((n) => ({ ...n, read: true }));
  setStored(STORAGE_KEYS.NOTIFICATIONS, updated);

  if (isFirebaseConfigured) {
    try {
      for (const n of existing.filter((x) => !x.read)) {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      }
    } catch {
      // Ignore
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('retinareach_notification_read', { detail: { all: true } }));
  }
}

/**
 * Subscribe to real-time notification updates with Firestore onSnapshot,
 * seamlessly falling back to custom window events for local operations.
 */
export function subscribeToNotifications(
  callback: (notifications: AppNotification[]) => void
): Unsubscribe {
  // If Firestore is available, use onSnapshot
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
      return onSnapshot(
        q,
        (snap) => {
          const list = snap.docs.map((d) => d.data() as AppNotification);
          setStored(STORAGE_KEYS.NOTIFICATIONS, list);
          callback(list);
        },
        (err) => {
          console.warn('Firestore onSnapshot error, falling back to local storage listener:', err);
          callback(getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS));
        }
      );
    } catch (e) {
      console.warn('Subscription setup exception:', e);
    }
  }

  // Local event listener fallback
  const handleLocalUpdate = () => {
    callback(getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS));
  };

  window.addEventListener('retinareach_notification', handleLocalUpdate);
  window.addEventListener('retinareach_notification_read', handleLocalUpdate);
  callback(getStored<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS));

  return () => {
    window.removeEventListener('retinareach_notification', handleLocalUpdate);
    window.removeEventListener('retinareach_notification_read', handleLocalUpdate);
  };
}

// -----------------------------------------------------------------------------
// METRICS & DASHBOARD STATS
// -----------------------------------------------------------------------------

export interface HealthWorkerStats {
  totalPatients: number;
  totalScreened: number;
  totalScreenings: number;
  highRiskCases: number;
  moderateRiskCases: number;
  lowRiskCases: number;
  pendingReferrals: number;
  scheduledReferrals: number;
  completedReferrals: number;
  screeningRatePercentage: number;
  doctorReviewedCount: number;
  doctorOverrideCount: number;
}

export async function getDashboardMetrics(): Promise<HealthWorkerStats> {
  await initDatabase();
  const patients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
  const screenings = getStored<Screening[]>(STORAGE_KEYS.SCREENINGS, SEED_SCREENINGS);
  const results = getStored<ScreeningResult[]>(STORAGE_KEYS.RESULTS, SEED_SCREENING_RESULTS);
  const referrals = getStored<Referral[]>(STORAGE_KEYS.REFERRALS, SEED_REFERRALS);

  const uniqueScreenedPatientIds = new Set(screenings.map((s) => s.patient_id));

  let highRisk = 0;
  let moderateRisk = 0;
  let lowRisk = 0;
  let doctorReviewed = 0;
  let doctorOverride = 0;

  results.forEach((r) => {
    const effectiveRisk = r.doctor_override_risk || r.risk_category;
    if (effectiveRisk === 'High') highRisk++;
    else if (effectiveRisk === 'Moderate') moderateRisk++;
    else lowRisk++;

    if (r.reviewed_by_doctor) doctorReviewed++;
    if (r.doctor_override_risk || r.doctor_override_stage) doctorOverride++;
  });

  const pendingRefs = referrals.filter((r) => r.referral_status === 'pending').length;
  const scheduledRefs = referrals.filter((r) => r.referral_status === 'scheduled').length;
  const completedRefs = referrals.filter((r) => r.referral_status === 'completed').length;

  const totalPatients = patients.length;
  const totalScreened = uniqueScreenedPatientIds.size;
  const screeningRatePercentage = totalPatients > 0 ? Math.round((totalScreened / totalPatients) * 100) : 0;

  return {
    totalPatients,
    totalScreened,
    totalScreenings: screenings.length,
    highRiskCases: highRisk,
    moderateRiskCases: moderateRisk,
    lowRiskCases: lowRisk,
    pendingReferrals: pendingRefs,
    scheduledReferrals: scheduledRefs,
    completedReferrals: completedRefs,
    screeningRatePercentage,
    doctorReviewedCount: doctorReviewed,
    doctorOverrideCount: doctorOverride,
  };
}

export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_PROFILES));
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
  localStorage.setItem(STORAGE_KEYS.SCREENINGS, JSON.stringify(SEED_SCREENINGS));
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(SEED_SCREENING_RESULTS));
  localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(SEED_REFERRALS));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
}
