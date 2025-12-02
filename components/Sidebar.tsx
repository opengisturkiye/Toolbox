import React from 'react';
import { TOOLS_CONFIG } from '../constants';
import { ToolType } from '../types';
import { ParameterInputs } from './ParameterInputs';
import { 
  Calculator, 
  BoxSelect, 
  Map as MapIcon, 
  Combine, 
  Scissors, 
  Layers, 
  Divide, 
  Merge, 
  Crop, 
  Maximize, 
  Triangle, 
  ScatterChart, 
  Search, 
  Target, 
  Grid3x3, 
  Compass, 
  Wifi,
  GitMerge, 
  Spline, 
  Ruler, 
  Split, 
  MoveHorizontal, 
  Magnet,
  Hexagon, 
  Activity, 
  LayoutGrid, 
  Shuffle, 
  Dna,
  CheckSquare,
  PieChart,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTool: ToolType | null;
  onSelectTool: (t: ToolType) => void;
  onRunAnalysis: (params: any) => void;
  isProcessing: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const getIcon = (id: string) => {
  switch (id) {
    case 'AREA': return <Calculator size={18} />;
    case 'BBOX': return <BoxSelect size={18} />;
    case 'CENTROID': return <MapIcon size={18} />;
    
    case 'SPATIAL_JOIN': return <Combine size={18} />;
    case 'INTERSECT': return <Scissors size={18} />;
    case 'UNION': return <Layers size={18} />;
    case 'DIFFERENCE': return <Divide size={18} />;
    case 'DISSOLVE': return <Merge size={18} />;
    case 'CLIP': return <Crop size={18} />;
    
    case 'BUFFER': return <Maximize size={18} />;
    case 'VORONOI': return <MapIcon size={18} />;
    case 'TIN': return <Triangle size={18} />;
    case 'KMEANS': return <ScatterChart size={18} />;
    case 'DBSCAN': return <Search size={18} />;
    case 'CONVEX_HULL': return <BoxSelect size={18} />;
    case 'NEAREST': return <Target size={18} />;
    case 'DISTANCE_MATRIX': return <Grid3x3 size={18} />;
    case 'BEARING': return <Compass size={18} />;
    case 'BASE_STATION_COVERAGE': return <Wifi size={18} />;
    
    case 'LINE_INTERSECT': return <GitMerge size={18} />;
    case 'BEZIER': return <Spline size={18} />;
    case 'LENGTH': return <Ruler size={18} />;
    case 'LINE_CHUNK': return <Split size={18} />;
    case 'LINE_OFFSET': return <MoveHorizontal size={18} />;
    case 'SNAP': return <Magnet size={18} />;
    
    case 'HEXBIN': return <Hexagon size={18} />;
    case 'ISOBANDS': 
    case 'IDW': return <Activity size={18} />;
    
    case 'POINT_GRID': 
    case 'SQUARE_GRID': 
    case 'TRIANGLE_GRID': 
    case 'HEX_GRID': return <LayoutGrid size={18} />;

    case 'RANDOM_POINT': 
    case 'RANDOM_LINE': 
    case 'RANDOM_POLYGON': 
    case 'SECTOR': 
    case 'ELLIPSE': return <Shuffle size={18} />;

    case 'POLYGON_TO_LINE': 
    case 'LINE_TO_POLYGON': 
    case 'SIMPLIFY': return <Dna size={18} />;

    default: 
      if (id.startsWith('BOOL_')) return <CheckSquare size={18} />;
      if (id === 'SECTOR') return <PieChart size={18} />;
      return <MapIcon size={18} />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, onRunAnalysis, isProcessing, isOpen, onClose }) => {
  const categories = Array.from(new Set(TOOLS_CONFIG.map(t => t.category)));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Araç Kutusu (Toolbox)</h2>
            <p className="text-xs text-slate-400 mt-1">Kategori seçip işlemi başlatın</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                {cat}
              </h3>
              <div className="space-y-1">
                {TOOLS_CONFIG.filter(t => t.category === cat).map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id as ToolType);
                      // On mobile, maybe close sidebar after selection? 
                      // keeping it open for parameter input for now.
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
                      ${activeTool === tool.id 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <span className={activeTool === tool.id ? 'text-blue-200' : 'text-slate-400 group-hover:text-slate-300'}>
                      {getIcon(tool.id)}
                    </span>
                    <div className="text-left">
                      <div className="font-medium">{tool.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700">
          {activeTool ? (
            <ParameterInputs 
              activeTool={activeTool} 
              onRun={(p) => {
                onRunAnalysis(p);
                // Close sidebar on mobile after running
                if (window.innerWidth < 1024) onClose();
              }} 
              isProcessing={isProcessing} 
            />
          ) : (
             <div className="text-center py-4 text-slate-500 text-sm">
               Bir araç seçin (Select tool)
             </div>
          )}
        </div>
      </div>
    </>
  );
};