import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  Sliders, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface FundusViewerProps {
  imageUrl: string;
  imageAlt?: string;
  eyeSide?: 'left' | 'right' | 'both';
  detectedFeatures?: string[];
  drStage?: string;
  riskCategory?: 'Low' | 'Moderate' | 'High';
  className?: string;
}

export const FundusViewer: React.FC<FundusViewerProps> = ({
  imageUrl,
  imageAlt = 'Retinal fundus image',
  eyeSide = 'both',
  detectedFeatures = [],
  drStage,
  riskCategory,
  className = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterMode, setFilterMode] = useState<'normal' | 'red_free' | 'high_contrast'>('normal');
  const [showOverlays, setShowOverlays] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleReset = () => {
    setZoomLevel(1);
    setFilterMode('normal');
  };

  // Red-free filter simulates ophthalmic green filter to enhance blood vessels and hemorrhages
  const getFilterStyle = () => {
    if (filterMode === 'red_free') {
      return 'hue-rotate-90 saturate-200 contrast-125 brightness-95';
    }
    if (filterMode === 'high_contrast') {
      return 'contrast-150 brightness-90';
    }
    return '';
  };

  return (
    <div className={`relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 ${className}`}>
      {/* Top Overlay Controls Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md font-mono text-[11px] text-teal-300 border border-teal-500/30">
            {eyeSide === 'left' ? 'OS · Left Eye' : eyeSide === 'right' ? 'OD · Right Eye' : 'Both Eyes / Fundus'}
          </span>
          {drStage && (
            <span className="text-slate-300 font-medium">
              {drStage}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg border border-white/10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 hover:bg-white/20 rounded transition-colors text-slate-200"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 hover:bg-white/20 rounded transition-colors text-slate-200"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 hover:bg-white/20 rounded transition-colors text-slate-200"
            title="Reset Zoom & Filters"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="w-px h-3.5 bg-white/20 mx-1"></div>

          {/* Red-free / Filter toggle */}
          <button
            type="button"
            onClick={() => {
              if (filterMode === 'normal') setFilterMode('red_free');
              else if (filterMode === 'red_free') setFilterMode('high_contrast');
              else setFilterMode('normal');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filterMode !== 'normal' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-white/20'
            }`}
            title="Toggle Red-Free / High Contrast Filter"
          >
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              <span>{filterMode === 'normal' ? 'Standard' : filterMode === 'red_free' ? 'Red-Free' : 'High Cont.'}</span>
            </span>
          </button>

          {/* Feature Highlight Toggle */}
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              showOverlays ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-white/20'
            }`}
            title="Toggle Feature Indicators"
          >
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Markers</span>
            </span>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="w-full h-80 sm:h-96 flex items-center justify-center overflow-hidden bg-black select-none">
        {imageError ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-10 h-10 text-amber-500" />
            <p className="text-sm font-medium text-slate-300">Retinal scan preview unavailable</p>
            <p className="text-xs text-slate-500 max-w-xs">The clinical fundus photograph could not be loaded from storage.</p>
          </div>
        ) : (
          <div
            className="relative transition-transform duration-200 ease-out"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className={`max-h-80 sm:max-h-96 object-contain rounded-md transition-all ${getFilterStyle()}`}
            />

            {/* Simulated Clinical Anatomical Markers (Only shown when markers toggle is active) */}
            {showOverlays && (
              <>
                {/* Optic Disc Pointer */}
                <div className="absolute top-[35%] left-[22%] -translate-x-1/2 -translate-y-1/2 pointer-events-none group">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-teal-400/80 bg-teal-400/10 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-teal-200 bg-black/70 px-1 rounded">
                      Optic Disc
                    </span>
                  </div>
                </div>

                {/* Macular Region Marker */}
                <div className="absolute top-[52%] left-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-16 h-16 rounded-full border border-amber-400/70 bg-amber-400/10 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-amber-200 bg-black/70 px-1 rounded">
                      Macula
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Features Strip */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Optical Clarity: High (50° Field of View)</span>
        </div>

        {detectedFeatures.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-400">Features:</span>
            <span className="truncate max-w-xs text-teal-300 font-medium">
              {detectedFeatures.slice(0, 2).join(', ')}
              {detectedFeatures.length > 2 && ` +${detectedFeatures.length - 2} more`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
