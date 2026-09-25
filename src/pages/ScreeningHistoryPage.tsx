import React, { useState, useEffect } from 'react';
import { ScreeningWithDetails, DRStage, RiskCategory } from '../types';
import { getScreenings } from '../services/db';
import { ReportModal } from '../components/screening/ReportModal';
import { CreateReferralModal } from '../components/referrals/CreateReferralModal';
import { FundusViewer } from '../components/medical/FundusViewer';
import { MedicalDisclaimerBanner } from '../components/medical/MedicalDisclaimerBanner';
import { 
  History, 
  Search, 
  Filter, 
  FileText, 
  SendHorizontal, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  MapPin, 
  Calendar 
} from 'lucide-react';

interface ScreeningHistoryPageProps {
  onNavigate: (path: string, params?: { patientId?: string }) => void;
}

export const ScreeningHistoryPage: React.FC<ScreeningHistoryPageProps> = ({ onNavigate }) => {
  const [screenings, setScreenings] = useState<ScreeningWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');

  // Modals & Selected Preview
  const [selectedScreeningForReport, setSelectedScreeningForReport] = useState<ScreeningWithDetails | null>(null);
  const [referralScreening, setReferralScreening] = useState<ScreeningWithDetails | null>(null);
  const [previewScreening, setPreviewScreening] = useState<ScreeningWithDetails | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getScreenings();
      setScreenings(data);
      if (data.length > 0 && !previewScreening) {
        setPreviewScreening(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredScreenings = screenings.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.patient?.full_name.toLowerCase().includes(q) ||
      s.patient?.patient_id_code.toLowerCase().includes(q) ||
      s.health_camp_location.toLowerCase().includes(q);

    const matchRisk = riskFilter === 'all' || s.result?.risk_category === riskFilter;
    const matchStage = stageFilter === 'all' || s.result?.dr_stage === stageFilter;

    return matchSearch && matchRisk && matchStage;
  });

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
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="w-3 h-3" /> Low Risk
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Screening Records & Image Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete database of AI-assisted retinal screenings and ophthalmologist review status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/screening')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Eye className="w-4 h-4" />
          <span>Launch New Screening</span>
        </button>
      </div>

      <MedicalDisclaimerBanner variant="compact" />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, patient ID, or camp location..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Risk Only</option>
              <option value="Moderate">Moderate Risk Only</option>
              <option value="Low">Low Risk Only</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All DR Stages</option>
              <option value="No DR">No DR</option>
              <option value="Mild DR">Mild DR</option>
              <option value="Moderate DR">Moderate DR</option>
              <option value="Severe DR">Severe DR</option>
              <option value="Proliferative DR">Proliferative DR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Screenings List + Active Previewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Screenings Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Screening Scans ({filteredScreenings.length})
            </span>
            <span className="text-[11px] text-slate-400">Click a row to preview fundus scan</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading records...</div>
            ) : filteredScreenings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No matching screening records.</div>
            ) : (
              filteredScreenings.map((s) => {
                const isSelected = previewScreening?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setPreviewScreening(s)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      isSelected ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={s.image_url}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {s.patient?.full_name || 'Unknown Patient'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {s.patient?.patient_id_code} · {s.eye_side.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{s.health_camp_location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-bold text-slate-900">{s.result?.dr_stage || 'Pending'}</div>
                      <div>{getRiskBadge(s.result?.risk_category)}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Scan Detail Viewer & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {previewScreening ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {previewScreening.patient?.full_name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Scan Ref: {previewScreening.id}
                  </div>
                </div>
                {getRiskBadge(previewScreening.result?.risk_category)}
              </div>

              {/* Fundus Viewer */}
              <FundusViewer
                imageUrl={previewScreening.image_url}
                imageAlt={previewScreening.image_filename}
                eyeSide={previewScreening.eye_side}
                detectedFeatures={previewScreening.result?.detected_features}
                drStage={previewScreening.result?.dr_stage}
                riskCategory={previewScreening.result?.risk_category}
              />

              {/* Clinical Details */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <div className="font-semibold text-slate-800">
                    Clinical Recommendation:
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {previewScreening.result?.recommendation}
                  </p>
                </div>

                {previewScreening.result?.detected_features && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">Markers: </span>
                    {previewScreening.result.detected_features.join(', ')}
                  </div>
                )}

                {previewScreening.referral && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs">
                    <span className="font-bold block">Referral Status: {previewScreening.referral.referral_status.toUpperCase()}</span>
                    <span>Facility: {previewScreening.referral.target_facility}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedScreeningForReport(previewScreening)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View & Print Report</span>
                </button>

                {!previewScreening.referral && previewScreening.result?.risk_category === 'High' && (
                  <button
                    type="button"
                    onClick={() => setReferralScreening(previewScreening)}
                    className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <SendHorizontal className="w-3.5 h-3.5" />
                    <span>Create Referral</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              Select a screening scan on the left to inspect the fundus image.
            </div>
          )}
        </div>
      </div>

      {/* Screening Report Modal */}
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

      {/* Referral Creation Modal */}
      {referralScreening && referralScreening.patient && (
        <CreateReferralModal
          isOpen={Boolean(referralScreening)}
          onClose={() => setReferralScreening(null)}
          screening={referralScreening}
          patient={referralScreening.patient}
          screeningResult={referralScreening.result}
          onReferralCreated={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
