import React, { useState } from 'react';
import { Info, CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultsPanelProps {
  result: AnalysisResult | null;
  onClose?: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!result) return null;

  return (
    <div className={`
        fixed lg:absolute 
        bottom-0 left-0 right-0 lg:left-auto lg:right-4 lg:bottom-8 
        bg-slate-800/95 backdrop-blur border-t lg:border border-slate-700 
        lg:rounded-lg shadow-2xl z-20 
        transition-all duration-300 ease-in-out
        w-full lg:max-w-sm
        ${isMinimized ? 'h-12' : 'max-h-[50vh] lg:max-h-[60vh]'}
    `}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer lg:cursor-auto"
        onClick={() => window.innerWidth < 1024 && setIsMinimized(!isMinimized)}
      >
        <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-blue-400" />
          Analiz Sonuçları (Results)
        </h3>
        <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            {/* Mobile Toggle Icons */}
            <span className="lg:hidden text-slate-400">
                {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </span>
             {/* Close Button (Desktop primarily, but useful on mobile too to clear state) */}
             {onClose && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onClose(); }}
                 className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
               >
                 <X size={16} />
               </button>
             )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="px-4 pb-4 overflow-y-auto max-h-[40vh] lg:max-h-[50vh]">
          <div className="space-y-3 text-sm">
            {result.message && (
              <p className="text-slate-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {result.message}
              </p>
            )}
            {result.stats && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                {Object.entries(result.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-800/50 last:border-0">
                    <span className="text-slate-400 capitalize pr-2 text-xs">{key}</span>
                    <span className="font-mono text-emerald-400 font-semibold text-right text-xs">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};