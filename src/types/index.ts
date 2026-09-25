export type UserRole = 'health_worker' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  health_center_name: string;
  created_at: string;
  updated_at: string;
}

export type DiabetesStatus = 'none' | 'type_1' | 'type_2' | 'prediabetes' | 'gestational';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface Patient {
  id: string;
  patient_id_code: string; // e.g. RR-2026-0842
  full_name: string;
  age: number;
  gender: Gender;
  phone: string;
  location: string; // Rural camp location or village
  diabetes_status: DiabetesStatus;
  duration_of_diabetes_years: number;
  blood_sugar_value?: number; // mg/dL (e.g. fasting or postprandial)
  hba1c_percentage?: number; // HbA1c % if available
  additional_notes?: string;
  created_by: string; // user profile id
  created_at: string;
  updated_at: string;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  blood_pressure?: string; // e.g. "130/85"
  bmi?: number;
  smoking_status?: 'never' | 'former' | 'current';
  last_eye_exam_date?: string;
  recorded_by: string;
  created_at: string;
}

export type EyeSide = 'left' | 'right' | 'both';

export type ScreeningStatus = 'completed' | 'pending_review' | 'cancelled';

export interface Screening {
  id: string;
  patient_id: string;
  eye_side: EyeSide;
  image_url: string;
  image_filename: string;
  image_size_bytes: number;
  image_resolution?: string;
  status: ScreeningStatus;
  screened_by: string; // user profile id
  health_camp_location: string;
  notes?: string;
  created_at: string;
}

export type DRStage = 'No DR' | 'Mild DR' | 'Moderate DR' | 'Severe DR' | 'Proliferative DR';

export type RiskCategory = 'Low' | 'Moderate' | 'High';

export interface ScreeningResult {
  id: string;
  screening_id: string;
  dr_stage: DRStage;
  risk_category: RiskCategory;
  confidence_score: number; // 0.0 to 1.0 (e.g. 0.94)
  recommendation: string;
  detected_features: string[]; // e.g. ["Microaneurysms", "Hard exudates", "Dot hemorrhages"]
  raw_ai_response?: Record<string, unknown>;
  is_mock_service: boolean;
  reviewed_by_doctor?: boolean;
  doctor_notes?: string;
  doctor_override_risk?: RiskCategory;
  doctor_override_stage?: DRStage;
  doctor_override_reason?: string;
  reviewed_by_doctor_id?: string;
  reviewed_by_doctor_name?: string;
  reviewed_at?: string;
  created_at: string;
}

export type ReferralStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export interface AppNotification {
  id: string;
  recipient_role?: 'health_worker' | 'doctor' | 'all';
  type: 'high_risk_screening' | 'referral_updated' | 'doctor_review' | 'general';
  title: string;
  message: string;
  patient_id?: string;
  patient_name?: string;
  screening_id?: string;
  referral_id?: string;
  risk_category?: RiskCategory;
  dr_stage?: DRStage;
  read: boolean;
  created_at: string;
}

export type CareLevel = 
  | 'district_hospital'
  | 'tertiary_eye_hospital'
  | 'vitreoretinal_specialist'
  | 'primary_clinic';

export type UrgencyLevel = 'immediate' | 'within_7_days' | 'within_30_days';

export interface Referral {
  id: string;
  screening_id: string;
  patient_id: string;
  reason: string;
  recommended_care_level: CareLevel;
  urgency: UrgencyLevel;
  referral_status: ReferralStatus;
  target_facility: string;
  notes?: string;
  referred_by: string; // user profile id
  referral_date: string;
  appointment_date?: string;
  created_at: string;
  updated_at: string;
}

// Composite types for display
export interface PatientWithHistory extends Patient {
  screenings_count: number;
  latest_screening?: Screening & { result?: ScreeningResult };
  active_referral?: Referral;
}

export interface ScreeningWithDetails extends Screening {
  patient?: Patient;
  result?: ScreeningResult;
  referral?: Referral;
  screened_by_name?: string;
}

export interface ReferralWithDetails extends Referral {
  patient?: Patient;
  screening?: Screening;
  screening_result?: ScreeningResult;
}
