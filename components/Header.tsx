import React from 'react';
import { Activity, Layers, Menu } from 'lucide-react';

interface HeaderProps {
  counts: {
    points: number;
    polygons: number;
    lines: number;
  };
  visibleLayers: {
    points: boolean;
    polygons: boolean;
    lines: boolean;
  };
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ counts, visibleLayers, onMenuClick }) => {
  return (
    <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 md:px-6 justify-between shadow-md z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Activity className="text-emerald-400 w-5 h-5 hidden sm:block" />
          <h1 className="font-semibold text-slate-100 text-sm sm:text-base truncate">
            GeoReact CBS Analisti
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
         <div className={`hidden md:flex items-center gap-2 transition-opacity duration-300 ${visibleLayers.points ? 'opacity-100' : 'opacity-30'}`}>
           <Layers className="w-4 h-4" />
           <span>{counts.points} Nokta</span>
         </div>
         <div className={`hidden md:flex items-center gap-2 transition-opacity duration-300 ${visibleLayers.polygons ? 'opacity-100' : 'opacity-30'}`}>
           <Layers className="w-4 h-4" />
           <span>{counts.polygons} Alan</span>
         </div>
         <div className={`hidden md:flex items-center gap-2 transition-opacity duration-300 ${visibleLayers.lines ? 'opacity-100' : 'opacity-30'}`}>
           <Layers className="w-4 h-4" />
           <span>{counts.lines} Çizgi</span>
         </div>
         {/* Mobile Counter Summary */}
         <div className="md:hidden flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>{counts.points + counts.polygons + counts.lines} Nesne</span>
         </div>
      </div>
    </header>
  );
};