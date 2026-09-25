import React, { useState } from 'react';
import { getDatabaseStatus } from '../services/supabaseClient';
import { 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Table, 
  Key, 
  Link2, 
  Layers, 
  Server
} from 'lucide-react';

export const DatabaseSchemaPage: React.FC = () => {
  const dbStatus = getDatabaseStatus();
  const [copied, setCopied] = useState(false);

  const tables = [
    {
      name: 'profiles',
      desc: 'Health workers, reviewing ophthalmologists, and admin accounts linked with Auth',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key (uuid-v4)' },
        { name: 'user_id', type: 'UUID', fk: true, desc: 'References auth.users(id)' },
        { name: 'email', type: 'TEXT', desc: 'Clinical login email' },
        { name: 'full_name', type: 'TEXT', desc: 'Full clinician / worker name' },
        { name: 'role', type: 'user_role ENUM', desc: "'health_worker' | 'doctor' | 'admin'" },
        { name: 'phone', type: 'TEXT', desc: 'Mobile contact for camp coordination' },
        { name: 'health_center_name', type: 'TEXT', desc: 'Base primary health camp' },
        { name: 'created_at', type: 'TIMESTAMPTZ', desc: 'Creation timestamp' },
      ],
      rls: 'Users view own profile; Admins view all profiles.',
    },
    {
      name: 'patients',
      desc: 'Rural community camp patient demographics, village location, and diabetic history',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'patient_id_code', type: 'VARCHAR(32)', desc: 'Human-readable ID (e.g. RR-2026-0041)' },
        { name: 'full_name', type: 'VARCHAR(255)', desc: 'Patient name' },
        { name: 'age', type: 'INTEGER', desc: 'Age in years (1-120)' },
        { name: 'gender', type: 'gender_type ENUM', desc: "'female' | 'male' | 'other' | 'prefer_not_to_say'" },
        { name: 'phone', type: 'VARCHAR(32)', desc: 'Contact / ASHA worker telephone' },
        { name: 'location', type: 'VARCHAR(255)', desc: 'Camp or village outreach post' },
        { name: 'diabetes_status', type: 'diabetes_status ENUM', desc: "'none' | 'type_1' | 'type_2' | 'prediabetes' | 'gestational'" },
        { name: 'duration_of_diabetes_years', type: 'NUMERIC(4,1)', desc: 'Known diabetes duration' },
        { name: 'blood_sugar_value', type: 'NUMERIC(6,1)', desc: 'Blood glucose (mg/dL)' },
        { name: 'hba1c_percentage', type: 'NUMERIC(4,1)', desc: 'Glycated hemoglobin percentage' },
        { name: 'created_by', type: 'UUID', fk: true, desc: 'References profiles(id)' },
      ],
      rls: 'Authenticated clinical staff can select, insert, and update patient rosters.',
    },
    {
      name: 'health_records',
      desc: 'Longitudinal clinical vitals and secondary ophthalmology indicators',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'patient_id', type: 'UUID', fk: true, desc: 'References patients(id) ON DELETE CASCADE' },
        { name: 'blood_pressure', type: 'VARCHAR(32)', desc: 'e.g. 130/85 mmHg' },
        { name: 'bmi', type: 'NUMERIC(4,1)', desc: 'Body mass index' },
        { name: 'smoking_status', type: 'VARCHAR(32)', desc: "'never' | 'former' | 'current'" },
        { name: 'last_eye_exam_date', type: 'DATE', desc: 'Last known professional exam' },
        { name: 'recorded_by', type: 'UUID', fk: true, desc: 'References profiles(id)' },
      ],
      rls: 'Authenticated health workers and doctors can read/insert health records.',
    },
    {
      name: 'screenings',
      desc: 'Master fundus retinal capture image records and optical acquisition metadata',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'patient_id', type: 'UUID', fk: true, desc: 'References patients(id) ON DELETE RESTRICT' },
        { name: 'eye_side', type: 'eye_side_type ENUM', desc: "'left' | 'right' | 'both'" },
        { name: 'image_url', type: 'TEXT', desc: 'Supabase Storage public URL or local asset' },
        { name: 'image_filename', type: 'VARCHAR(255)', desc: 'Original scan filename' },
        { name: 'image_size_bytes', type: 'BIGINT', desc: 'File payload size in bytes' },
        { name: 'image_resolution', type: 'VARCHAR(64)', desc: 'e.g. 1920x1440' },
        { name: 'status', type: 'screening_status_type ENUM', desc: "'completed' | 'pending_review' | 'cancelled'" },
        { name: 'screened_by', type: 'UUID', fk: true, desc: 'References profiles(id)' },
        { name: 'health_camp_location', type: 'VARCHAR(255)', desc: 'Field camp venue' },
      ],
      rls: 'All clinical staff can view and insert screenings; cascade protections preserve history.',
    },
    {
      name: 'screening_results',
      desc: 'AI-assisted diabetic retinopathy staging, risk classification, and detected features',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'screening_id', type: 'UUID', fk: true, desc: 'References screenings(id) ON DELETE CASCADE' },
        { name: 'dr_stage', type: 'dr_stage_type ENUM', desc: "'No DR' | 'Mild DR' | 'Moderate DR' | 'Severe DR' | 'Proliferative DR'" },
        { name: 'risk_category', type: 'risk_category_type ENUM', desc: "'Low' | 'Moderate' | 'High'" },
        { name: 'confidence_score', type: 'NUMERIC(5,4)', desc: 'Probability confidence (0.0 to 1.0)' },
        { name: 'recommendation', type: 'TEXT', desc: 'Clinical care pathway guidance' },
        { name: 'detected_features', type: 'JSONB', desc: 'Array of detected microvascular signs' },
        { name: 'is_mock_service', type: 'BOOLEAN', desc: 'Explicit mock prototype label' },
        { name: 'reviewed_by_doctor', type: 'BOOLEAN', desc: 'Doctor sign-off flag' },
        { name: 'doctor_notes', type: 'TEXT', desc: 'Ophthalmologist review annotations' },
      ],
      rls: 'Clinical staff can view and insert; only Doctors and Admins can update review flags.',
    },
    {
      name: 'referrals',
      desc: 'Escalation pathways to district and tertiary eye hospitals for high-risk patients',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'screening_id', type: 'UUID', fk: true, desc: 'References screenings(id) ON DELETE RESTRICT' },
        { name: 'patient_id', type: 'UUID', fk: true, desc: 'References patients(id) ON DELETE RESTRICT' },
        { name: 'reason', type: 'TEXT', desc: 'Clinical referral rationale' },
        { name: 'recommended_care_level', type: 'care_level_type ENUM', desc: "'district_hospital' | 'tertiary_eye_hospital' | 'vitreoretinal_specialist' | 'primary_clinic'" },
        { name: 'urgency', type: 'urgency_type ENUM', desc: "'immediate' | 'within_7_days' | 'within_30_days'" },
        { name: 'referral_status', type: 'referral_status_type ENUM', desc: "'pending' | 'scheduled' | 'completed' | 'cancelled'" },
        { name: 'target_facility', type: 'VARCHAR(255)', desc: 'Destination ophthalmology facility' },
        { name: 'appointment_date', type: 'DATE', desc: 'Confirmed appointment slot' },
        { name: 'referred_by', type: 'UUID', fk: true, desc: 'References profiles(id)' },
      ],
      rls: 'Clinical staff can create referrals; doctors and admins can update statuses.',
    },
  ];

  const handleCopySql = () => {
    const sql = `-- RetinaReach PostgreSQL Schema
-- Migration file located at: /supabase/migrations/20260925_init_retinareach.sql
-- Run in your Supabase SQL Editor or PostgreSQL 15+ console`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Database Schema & Security
            </h1>
            <span className="text-[11px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
              PostgreSQL 15+ / Supabase RLS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data integrity architecture with strict foreign key constraints and Row-Level Security.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopySql}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Migration Ref Copied' : 'Copy Migration Reference'}</span>
        </button>
      </div>

      {/* Backend Engine Status Card */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <span>Active Database Engine:</span>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-800 rounded font-mono text-[11px]">
                {dbStatus.provider === 'supabase' ? 'Supabase PostgreSQL Cloud' : 'Local Persistent Engine with Supabase Compatibility'}
              </span>
            </div>
            <p className="text-slate-500 mt-0.5">
              Full relational schemas, indexed lookups, and screening record integrity enforced.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>RLS Active</span>
        </div>
      </div>

      {/* Relational Hierarchy Diagram */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          Relational Hierarchy & Cascade Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
            <div className="text-teal-400 font-semibold mb-1">Hierarchy 1: Demographic & Longitudinal Track</div>
            <div>profiles [id] (Auth)</div>
            <div className="text-slate-500 pl-4">└── patients [created_by -&gt; profiles.id]</div>
            <div className="text-slate-500 pl-8">└── health_records [patient_id -&gt; patients.id (CASCADE)]</div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
            <div className="text-teal-400 font-semibold mb-1">Hierarchy 2: Screening & Escalation Track</div>
            <div>patients [id]</div>
            <div className="text-slate-500 pl-4">└── screenings [patient_id -&gt; patients.id (RESTRICT)]</div>
            <div className="text-slate-500 pl-8">├── screening_results [screening_id -&gt; screenings.id (CASCADE)]</div>
            <div className="text-slate-500 pl-8">└── referrals [screening_id -&gt; screenings.id (RESTRICT)]</div>
          </div>
        </div>
      </div>

      {/* Tables Detailed Explorer */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <Table className="w-4 h-4 text-teal-700" />
          Core PostgreSQL Tables ({tables.length})
        </h3>

        <div className="space-y-4">
          {tables.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-teal-900">{t.name}</span>
                    <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                      Table
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{t.desc}</p>
                </div>

                <div className="text-[11px] text-slate-600 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                  RLS: {t.rls}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 font-semibold">
                    <tr>
                      <th className="py-2.5 px-4 w-44">Column Name</th>
                      <th className="py-2.5 px-4 w-40">Data Type</th>
                      <th className="py-2.5 px-4 w-28">Keys</th>
                      <th className="py-2.5 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                    {t.columns.map((c) => (
                      <tr key={c.name} className="hover:bg-slate-50/60">
                        <td className="py-2 px-4 font-mono font-medium text-slate-900">{c.name}</td>
                        <td className="py-2 px-4 font-mono text-[11px] text-slate-600">{c.type}</td>
                        <td className="py-2 px-4">
                          {c.pk && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                              <Key className="w-2.5 h-2.5" /> PK
                            </span>
                          )}
                          {c.fk && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">
                              <Link2 className="w-2.5 h-2.5" /> FK
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-slate-600">{c.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
