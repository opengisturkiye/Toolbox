import React, { useState, useEffect } from 'react';
import { ToolType } from '../types';
import { Play } from 'lucide-react';

interface ParameterInputsProps {
  activeTool: ToolType;
  onRun: (params: any) => void;
  isProcessing: boolean;
}

export const ParameterInputs: React.FC<ParameterInputsProps> = ({ activeTool, onRun, isProcessing }) => {
  // Centralized state for all potential parameters
  const [params, setParams] = useState({
    radius: 0.5,
    cellSide: 0.2,
    cellSize: 1.0,
    numberOfClusters: 5,
    sharpness: 0.85,
    breaks: 5,
    maxDistance: 0.5,
    dbscanDist: 0.2,
    tolerance: 0.001,
    length: 0.5,
    distance: 0.1, // used for offset and snap
    count: 50,
    // Sector/Ellipse
    sectorRadius: 1,
    bearing1: 0,
    bearing2: 90,
    xSemiAxis: 1,
    ySemiAxis: 0.5,
    // Coverage
    coverageRadius: 3
  });

  // Reset or adjust defaults when tool changes if needed
  useEffect(() => {
     // Optional: Reset specific params when tool switches
  }, [activeTool]);

  const updateParam = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = () => {
    // Pass the state object. The service will pick what it needs.
    // For specific mapping (like snapDist -> distance), we can map here or in the service.
    // Let's map strict names here to match service expectations
    const serviceParams: any = { ...params };
    
    // Mapping generic state to specific service expectations where names diverged in original code
    // The original code had distinct state variables mapped to keys like 'maxDistance'
    
    // Mapping for specific tools based on original Sidebar logic:
    if (activeTool === ToolType.IDW) {
        serviceParams.cellSize = params.cellSize;
        serviceParams.exponent = 2;
    }
    if (activeTool === ToolType.HEXBIN) serviceParams.cellSide = params.cellSide;
    if (activeTool === ToolType.LINE_OFFSET || activeTool === ToolType.SNAP) {
        serviceParams.distance = params.distance;
    }
    if (activeTool === ToolType.SECTOR) {
        serviceParams.radius = params.sectorRadius;
        serviceParams.bearing1 = params.bearing1;
        serviceParams.bearing2 = params.bearing2;
    }
    if (activeTool === ToolType.ELLIPSE) {
        serviceParams.xSemiAxis = params.xSemiAxis;
        serviceParams.ySemiAxis = params.ySemiAxis;
    }
    if (activeTool === ToolType.BASE_STATION_COVERAGE) {
        serviceParams.radius = params.coverageRadius;
    }
    if (activeTool === ToolType.DBSCAN) {
        serviceParams.maxDistance = params.dbscanDist;
    }
    if (activeTool === ToolType.DISTANCE_MATRIX) {
        serviceParams.maxDistance = params.maxDistance;
    }

    onRun(serviceParams);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-200 flex justify-between items-center">
         <span>Parametreler (Params)</span>
         <span className="text-xs text-slate-500">{activeTool}</span>
      </div>

      {activeTool === ToolType.BUFFER && (
         <InputRange label="Yarıçap / Radius (km)" val={params.radius} setVal={(v) => updateParam('radius', v)} min={0.1} max={2} step={0.1} />
      )}
      {activeTool === ToolType.HEXBIN && (
         <InputRange label="Petek Boyutu / Cell (km)" val={params.cellSide} setVal={(v) => updateParam('cellSide', v)} min={0.05} max={0.5} step={0.05} />
      )}
      {activeTool === ToolType.KMEANS && (
         <InputRange label="Küme Sayısı / Clusters" val={params.numberOfClusters} setVal={(v) => updateParam('numberOfClusters', v)} min={2} max={10} step={1} unit="" />
      )}
      {activeTool === ToolType.BEZIER && (
         <InputRange label="Keskinlik / Sharpness" val={params.sharpness} setVal={(v) => updateParam('sharpness', v)} min={0} max={1} step={0.05} unit="" />
      )}
      {activeTool === ToolType.ISOBANDS && (
         <InputRange label="Seviye / Breaks" val={params.breaks} setVal={(v) => updateParam('breaks', v)} min={3} max={10} step={1} unit="" />
      )}
      {activeTool === ToolType.IDW && (
         <InputRange label="Hücre Boyutu / Cell (km)" val={params.cellSize} setVal={(v) => updateParam('cellSize', v)} min={0.05} max={0.5} step={0.05} />
      )}
      {activeTool === ToolType.DISTANCE_MATRIX && (
         <InputRange label="Max Mesafe / Dist (km)" val={params.maxDistance} setVal={(v) => updateParam('maxDistance', v)} min={0.5} max={5} step={0.5} />
      )}
      
      {['POINT_GRID', 'SQUARE_GRID', 'TRIANGLE_GRID', 'HEX_GRID'].includes(activeTool) && (
         <InputRange label="Hücre Boyutu / Cell Size (km)" val={params.cellSize} setVal={(v) => updateParam('cellSize', v)} min={0.1} max={2} step={0.1} />
      )}
      
      {['RANDOM_POINT', 'RANDOM_LINE', 'RANDOM_POLYGON'].includes(activeTool) && (
         <InputRange label="Adet / Count" val={params.count} setVal={(v) => updateParam('count', v)} min={10} max={200} step={10} unit="" />
      )}

      {activeTool === ToolType.SIMPLIFY && (
         <InputRange label="Tolerans / Tolerance (Derece)" val={params.tolerance} setVal={(v) => updateParam('tolerance', v)} min={0.0001} max={0.01} step={0.0001} unit="deg" />
      )}
      {activeTool === ToolType.DBSCAN && (
         <InputRange label="Max Mesafe / Dist (km)" val={params.dbscanDist} setVal={(v) => updateParam('dbscanDist', v)} min={0.05} max={1} step={0.05} />
      )}
      {activeTool === ToolType.LINE_CHUNK && (
         <InputRange label="Parça Uzunluğu / Len (km)" val={params.length} setVal={(v) => updateParam('length', v)} min={0.1} max={1} step={0.1} />
      )}
      {activeTool === ToolType.LINE_OFFSET && (
         <InputRange label="Ofset / Offset (km)" val={params.distance} setVal={(v) => updateParam('distance', v)} min={-0.5} max={0.5} step={0.05} />
      )}
       {activeTool === ToolType.SNAP && (
         <InputRange label="Yapıştırma Mesafesi (km)" val={params.distance} setVal={(v) => updateParam('distance', v)} min={0.05} max={1} step={0.05} />
      )}

      {activeTool === ToolType.SECTOR && (
         <>
           <InputRange label="Yarıçap / Radius (km)" val={params.sectorRadius} setVal={(v) => updateParam('sectorRadius', v)} min={0.5} max={5} step={0.5} />
           <InputRange label="Başlangıç Açısı / Angle 1" val={params.bearing1} setVal={(v) => updateParam('bearing1', v)} min={0} max={360} step={10} unit="°" />
           <InputRange label="Bitiş Açısı / Angle 2" val={params.bearing2} setVal={(v) => updateParam('bearing2', v)} min={0} max={360} step={10} unit="°" />
         </>
      )}

      {activeTool === ToolType.ELLIPSE && (
         <>
           <InputRange label="X Ekseni / X Axis (km)" val={params.xSemiAxis} setVal={(v) => updateParam('xSemiAxis', v)} min={0.5} max={5} step={0.5} />
           <InputRange label="Y Ekseni / Y Axis (km)" val={params.ySemiAxis} setVal={(v) => updateParam('ySemiAxis', v)} min={0.5} max={5} step={0.5} />
         </>
      )}
      
      {activeTool === ToolType.BASE_STATION_COVERAGE && (
         <>
           <InputRange label="Max Kapsama / Max Radius (2G) (km)" val={params.coverageRadius} setVal={(v) => updateParam('coverageRadius', v)} min={1} max={10} step={0.5} />
         </>
      )}

      <button
        onClick={handleRun}
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
  );
};

const InputRange = ({ label, val, setVal, min, max, step, unit = "km" }: { label: string, val: number, setVal: (v: number) => void, min: number, max: number, step: number, unit?: string }) => (
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