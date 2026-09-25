import React from 'react';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface MedicalDisclaimerBannerProps {
  variant?: 'compact' | 'prominent' | 'card';
  className?: string;
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({
  variant = 'compact',
  className = '',
}) => {
  if (variant === 'prominent') {
    return (
      <div
        role="alert"
        className={`bg-amber-50/90 border border-amber-200/80 rounded-xl p-4 text-amber-950 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="font-semibold flex items-center gap-2">
              <span>Medical Safety & Regulatory Screening Notice</span>
              <span className="text-xs bg-amber-200/70 text-amber-900 font-medium px-2 py-0.5 rounded">
                Screening Support Only
              </span>
            </div>
            <p className="text-amber-900/90 leading-relaxed">
              This tool is intended for screening support and does not replace professional medical diagnosis or ophthalmological examination.
              Screening results are preliminary risk classifications to assist healthcare workers in identifying individuals requiring further clinical evaluation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 ${className}`}>
        <div className="flex items-center gap-2 font-medium text-slate-800 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Clinical Screening Protocol Safeguard</span>
        </div>
        <p className="leading-normal">
          AI-assisted screening result — not a medical diagnosis. All high-risk cases require referral for dilated fundus examination by a certified ophthalmologist.
        </p>
      </div>
    );
  }

  // Compact banner for headers & screening flows
  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2 bg-amber-50/80 border border-amber-200/60 rounded-lg text-xs text-amber-900 ${className}`}
    >
      <Info className="w-4 h-4 text-amber-700 shrink-0" />
      <span className="leading-snug">
        <strong>Screening Support Tool:</strong> This tool is intended for screening support and does not replace professional medical diagnosis or ophthalmological examination.
      </span>
    </div>
  );
};
