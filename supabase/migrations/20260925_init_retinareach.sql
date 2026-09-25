-- ==============================================================================
-- RetinaReach: AI-Assisted Retinal Screening Platform
-- PostgreSQL Database Migration with Row Level Security (RLS) & Foreign Keys
-- Compatible with PostgreSQL 15+ and Supabase Database Engine
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('health_worker', 'doctor', 'admin');
CREATE TYPE diabetes_status AS ENUM ('none', 'type_1', 'type_2', 'prediabetes', 'gestational');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE eye_side_type AS ENUM ('left', 'right', 'both');
CREATE TYPE screening_status_type AS ENUM ('completed', 'pending_review', 'cancelled');
CREATE TYPE dr_stage_type AS ENUM ('No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR');
CREATE TYPE risk_category_type AS ENUM ('Low', 'Moderate', 'High');
CREATE TYPE care_level_type AS ENUM ('district_hospital', 'tertiary_eye_hospital', 'vitreoretinal_specialist', 'primary_clinic');
CREATE TYPE urgency_type AS ENUM ('immediate', 'within_7_days', 'within_30_days');
CREATE TYPE referral_status_type AS ENUM ('pending', 'scheduled', 'completed', 'cancelled');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE: profiles
-- Stores healthcare workers, reviewer doctors, and admin staff credentials/metadata
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL, -- references auth.users(id) in Supabase Auth
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'health_worker',
    phone TEXT,
    health_center_name TEXT NOT NULL DEFAULT 'Rural Health Outreach Camp',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABLE: patients
-- Stores patient demographics, village location, and metabolic diabetes profiles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. RR-2026-0001
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 130),
    gender gender_type NOT NULL,
    phone VARCHAR(32) NOT NULL,
    location VARCHAR(255) NOT NULL,
    diabetes_status diabetes_status NOT NULL DEFAULT 'none',
    duration_of_diabetes_years NUMERIC(4, 1) NOT NULL DEFAULT 0.0 CHECK (duration_of_diabetes_years >= 0),
    blood_sugar_value NUMERIC(6, 1), -- mg/dL
    hba1c_percentage NUMERIC(4, 1), -- %
    additional_notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(patient_id_code);
CREATE INDEX IF NOT EXISTS idx_patients_location ON patients(location);
CREATE INDEX IF NOT EXISTS idx_patients_diabetes ON patients(diabetes_status);

-- ==============================================================================
-- 4. TABLE: health_records
-- Longitudinal secondary clinical data per patient (vitals, systemic indicators)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    blood_pressure VARCHAR(32), -- e.g. "135/85"
    bmi NUMERIC(4, 1),
    smoking_status VARCHAR(32) DEFAULT 'never',
    last_eye_exam_date DATE,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_records_patient ON health_records(patient_id);

-- ==============================================================================
-- 5. TABLE: screenings
-- Master retinal fundus image acquisition records for patients
-- ==============================================================================
CREATE TABLE IF NOT EXISTS screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    eye_side eye_side_type NOT NULL DEFAULT 'both',
    image_url TEXT NOT NULL,
    image_filename VARCHAR(255) NOT NULL,
    image_size_bytes BIGINT NOT NULL,
    image_resolution VARCHAR(64),
    status screening_status_type NOT NULL DEFAULT 'completed',
    screened_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    health_camp_location VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenings_patient ON screenings(patient_id);
CREATE INDEX IF NOT EXISTS idx_screenings_created_at ON screenings(created_at DESC);

-- ==============================================================================
-- 6. TABLE: screening_results
-- AI-assisted risk classification and feature detection results
-- Relationship: patients -> screenings -> screening_results
-- ==============================================================================
CREATE TABLE IF NOT EXISTS screening_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    dr_stage dr_stage_type NOT NULL,
    risk_category risk_category_type NOT NULL,
    confidence_score NUMERIC(5, 4) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    recommendation TEXT NOT NULL,
    detected_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_ai_response JSONB,
    is_mock_service BOOLEAN NOT NULL DEFAULT TRUE,
    reviewed_by_doctor BOOLEAN NOT NULL DEFAULT FALSE,
    doctor_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_results_screening ON screening_results(screening_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_risk ON screening_results(risk_category);
CREATE INDEX IF NOT EXISTS idx_screening_results_stage ON screening_results(dr_stage);

-- ==============================================================================
-- 7. TABLE: referrals
-- Ophthalmologist escalation pathways for high-risk and moderate-risk patients
-- Relationship: screenings -> referrals
-- ==============================================================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    recommended_care_level care_level_type NOT NULL DEFAULT 'district_hospital',
    urgency urgency_type NOT NULL DEFAULT 'within_30_days',
    referral_status referral_status_type NOT NULL DEFAULT 'pending',
    target_facility VARCHAR(255) NOT NULL,
    notes TEXT,
    referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
    appointment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_patient ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_screening ON referrals(screening_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(referral_status);
CREATE INDEX IF NOT EXISTS idx_referrals_urgency ON referrals(urgency);

-- ==============================================================================
-- 8. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch requesting user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile, Admins can view all
CREATE POLICY "Profiles view policy" ON profiles
    FOR SELECT USING (auth.uid() = user_id OR current_user_role() = 'admin');

CREATE POLICY "Profiles update policy" ON profiles
    FOR UPDATE USING (auth.uid() = user_id OR current_user_role() = 'admin');

-- Patients: Health workers, Doctors, and Admins can view and manage
CREATE POLICY "Patients select policy" ON patients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Patients insert policy" ON patients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Patients update policy" ON patients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Health Records: Authenticated staff can view and insert
CREATE POLICY "Health records select policy" ON health_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Health records insert policy" ON health_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Screenings & Screening Results: All clinical staff can view and record
CREATE POLICY "Screenings select policy" ON screenings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Screenings insert policy" ON screenings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Screening results select policy" ON screening_results
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Screening results insert policy" ON screening_results
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Screening results doctor update policy" ON screening_results
    FOR UPDATE USING (current_user_role() IN ('doctor', 'admin'));

-- Referrals: Clinical staff can create, doctors/admins can update status
CREATE POLICY "Referrals select policy" ON referrals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Referrals insert policy" ON referrals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Referrals update policy" ON referrals
    FOR UPDATE USING (auth.role() = 'authenticated');
