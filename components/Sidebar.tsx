import React, { useState } from 'react';
import { TOOLS_CONFIG } from '../constants';
import { ToolType } from '../types';
import { 
  Calculator, 
  BoxSelect, 
  Map as MapIcon, 
  Combine, 
  Scissors, 
  Maximize, 
  GitMerge,
  Hexagon,
  Play,
  Layers,
  Divide,
  Triangle,
  ScatterChart,
  Merge,
  Spline,
  Target,
  Activity,
  Ruler,
  Grid3x3,
  Dna,
  LayoutGrid,
  Shuffle,
  CheckSquare,
  Search,
  Split,
  Magnet, 
  Compass, 
  PieChart, 
  Crop, 
  MoveHorizontal,
  Wifi // Changed icon for Coverage
} from 'lucide-react';

interface SidebarProps {
  activeTool: ToolType | null;
  onSelectTool: (t: ToolType) => void;
  onRunAnalysis: (params?: any) => void;
  isProcessing: boolean;
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

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, onRunAnalysis, isProcessing }) => {
  // Parameter States
  const [bufferRadius, setBufferRadius] = useState(0.5);
  const [hexSize, setHexSize] = useState(0.2);
  const [kClusters, setKClusters] = useState(5);
  const [bezierSharpness, setBezierSharpness] = useState(0.85);
  const [isoBreaks, setIsoBreaks] = useState(5);
  const [gridCellSize, setGridCellSize] = useState(1.0); 
  const [randomCount, setRandomCount] = useState(50);
  const [simplifyTolerance, setSimplifyTolerance] = useState(0.001); // Default more sensitive
  const [dbscanDist, setDbscanDist] = useState(0.2);
  const [chunkLen, setChunkLen] = useState(0.5);
  const [distMatrixMax, setDistMatrixMax] = useState(0.5);
  
  // New Params
  const [offsetDist, setOffsetDist] = useState(0.1);
  const [snapDist, setSnapDist] = useState(0.2); 
  const [sectorRadius, setSectorRadius] = useState(1);
  const [sectorAngle1, setSectorAngle1] = useState(0);
  const [sectorAngle2, setSectorAngle2] = useState(90);
  const [ellipseX, setEllipseX] = useState(1);
  const [ellipseY, setEllipseY] = useState(0.5);
  
  // Coverage Params
  const [coverageRadius, setCoverageRadius] = useState(3);

  const categories = Array.from(new Set(TOOLS_CONFIG.map(t => t.category)));

  const handleRunClick = () => {
    const params: any = {};
    
    if (activeTool === ToolType.BUFFER) { params.radius = bufferRadius; }
    if (activeTool === ToolType.HEXBIN) params.cellSide = hexSize;
    if (activeTool === ToolType.KMEANS) params.numberOfClusters = kClusters;
    if (activeTool === ToolType.BEZIER) params.sharpness = bezierSharpness;
    if (activeTool === ToolType.ISOBANDS) params.breaks = isoBreaks;
    if (activeTool === ToolType.IDW) { params.cellSize = gridCellSize; params.exponent = 2; }
    if (activeTool === ToolType.DISTANCE_MATRIX) params.maxDistance = distMatrixMax;
    
    if (['POINT_GRID', 'SQUARE_GRID', 'TRIANGLE_GRID', 'HEX_GRID'].includes(activeTool || '')) {
      params.cellSize = gridCellSize;
    }
    
    if (['RANDOM_POINT', 'RANDOM_LINE', 'RANDOM_POLYGON'].includes(activeTool || '')) {
      params.count = randomCount;
    }

    if (activeTool === ToolType.SIMPLIFY) params.tolerance = simplifyTolerance;
    if (activeTool === ToolType.DBSCAN) params.maxDistance = dbscanDist;
    if (activeTool === ToolType.LINE_CHUNK) params.length = chunkLen;
    if (activeTool === ToolType.LINE_OFFSET) params.distance = offsetDist;
    if (activeTool === ToolType.SNAP) params.distance = snapDist;
    
    if (activeTool === ToolType.SECTOR) {
        params.radius = sectorRadius;
        params.bearing1 = sectorAngle1;
        params.bearing2 = sectorAngle2;
    }
    if (activeTool === ToolType.ELLIPSE) {
        params.xSemiAxis = ellipseX;
        params.ySemiAxis = ellipseY;
    }
    
    if (activeTool === ToolType.BASE_STATION_COVERAGE) {
        params.radius = coverageRadius;
    }
    
    onRunAnalysis(params);
  };

  return (
    <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-20">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100">Araç Kutusu (Toolbox)</h2>
        <p className="text-xs text-slate-400 mt-1">Kategori seçip işlemi başlatın</p>
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
                  onClick={() => onSelectTool(tool.id as ToolType)}
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
          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-200 flex justify-between items-center">
               <span>Parametreler (Params)</span>
               <span className="text-xs text-slate-500">{activeTool}</span>
            </div>
            
            {activeTool === ToolType.BUFFER && (
               <>
                 <InputRange label="Yarıçap / Radius (km)" val={bufferRadius} setVal={setBufferRadius} min={0.1} max={2} step={0.1} />
               </>
            )}
            {activeTool === ToolType.HEXBIN && (
               <InputRange label="Petek Boyutu / Cell (km)" val={hexSize} setVal={setHexSize} min={0.05} max={0.5} step={0.05} />
            )}
            {activeTool === ToolType.KMEANS && (
               <InputRange label="Küme Sayısı / Clusters" val={kClusters} setVal={setKClusters} min={2} max={10} step={1} unit="" />
            )}
            {activeTool === ToolType.BEZIER && (
               <InputRange label="Keskinlik / Sharpness" val={bezierSharpness} setVal={setBezierSharpness} min={0} max={1} step={0.05} unit="" />
            )}
            {activeTool === ToolType.ISOBANDS && (
               <InputRange label="Seviye / Breaks" val={isoBreaks} setVal={setIsoBreaks} min={3} max={10} step={1} unit="" />
            )}
            {activeTool === ToolType.IDW && (
               <InputRange label="Hücre Boyutu / Cell (km)" val={gridCellSize} setVal={setGridCellSize} min={0.05} max={0.5} step={0.05} />
            )}
            {activeTool === ToolType.DISTANCE_MATRIX && (
               <InputRange label="Max Mesafe / Dist (km)" val={distMatrixMax} setVal={setDistMatrixMax} min={0.5} max={5} step={0.5} />
            )}
            
            {['POINT_GRID', 'SQUARE_GRID', 'TRIANGLE_GRID', 'HEX_GRID'].includes(activeTool) && (
               <InputRange label="Hücre Boyutu / Cell Size (km)" val={gridCellSize} setVal={setGridCellSize} min={0.1} max={2} step={0.1} />
            )}
            
            {['RANDOM_POINT', 'RANDOM_LINE', 'RANDOM_POLYGON'].includes(activeTool) && (
               <InputRange label="Adet / Count" val={randomCount} setVal={setRandomCount} min={10} max={200} step={10} unit="" />
            )}

            {activeTool === ToolType.SIMPLIFY && (
               <InputRange label="Tolerans / Tolerance (Derece)" val={simplifyTolerance} setVal={setSimplifyTolerance} min={0.0001} max={0.01} step={0.0001} unit="deg" />
            )}
            {activeTool === ToolType.DBSCAN && (
               <InputRange label="Max Mesafe / Dist (km)" val={dbscanDist} setVal={setDbscanDist} min={0.05} max={1} step={0.05} />
            )}
            {activeTool === ToolType.LINE_CHUNK && (
               <InputRange label="Parça Uzunluğu / Len (km)" val={chunkLen} setVal={setChunkLen} min={0.1} max={1} step={0.1} />
            )}
            {activeTool === ToolType.LINE_OFFSET && (
               <InputRange label="Ofset / Offset (km)" val={offsetDist} setVal={setOffsetDist} min={-0.5} max={0.5} step={0.05} />
            )}
             {activeTool === ToolType.SNAP && (
               <InputRange label="Yapıştırma Mesafesi (km)" val={snapDist} setVal={setSnapDist} min={0.05} max={1} step={0.05} />
            )}

            {activeTool === ToolType.SECTOR && (
               <>
                 <InputRange label="Yarıçap / Radius (km)" val={sectorRadius} setVal={setSectorRadius} min={0.5} max={5} step={0.5} />
                 <InputRange label="Başlangıç Açısı / Angle 1" val={sectorAngle1} setVal={setSectorAngle1} min={0} max={360} step={10} unit="°" />
                 <InputRange label="Bitiş Açısı / Angle 2" val={sectorAngle2} setVal={setSectorAngle2} min={0} max={360} step={10} unit="°" />
               </>
            )}

            {activeTool === ToolType.ELLIPSE && (
               <>
                 <InputRange label="X Ekseni / X Axis (km)" val={ellipseX} setVal={setEllipseX} min={0.5} max={5} step={0.5} />
                 <InputRange label="Y Ekseni / Y Axis (km)" val={ellipseY} setVal={setEllipseY} min={0.5} max={5} step={0.5} />
               </>
            )}
            
            {activeTool === ToolType.BASE_STATION_COVERAGE && (
               <>
                 <InputRange label="Max Kapsama / Max Radius (2G) (km)" val={coverageRadius} setVal={setCoverageRadius} min={1} max={10} step={0.5} />
               </>
            )}

            <button
              onClick={handleRunClick}
              disabled={isProcessing}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'İşleniyor (Processing)...' : (
                <>
                  <Play size={16} fill="currentColor" />
                  Çalıştır (Run)
                </>
              )}
            </button>
          </div>
        ) : (
           <div className="text-center py-4 text-slate-500 text-sm">
             Bir araç seçin (Select tool)
           </div>
        )}
      </div>
    </div>
  );
};

const InputRange = ({ label, val, setVal, min, max, step, unit = "km" }: any) => (
  <div className="space-y-2">
     <label className="text-xs text-slate-400 block">{label}</label>
     <input 
       type="range" 
       min={min} 
       max={max} 
       step={step} 
       value={val}
       onChange={(e) => setVal(parseFloat(e.target.value))}
       className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
     />
     <div className="text-right text-xs text-blue-400 font-mono">{val} {unit}</div>
   </div>
);