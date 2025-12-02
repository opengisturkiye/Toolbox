import React, { useState, useCallback, useMemo } from 'react';
import { MapWrapper } from './components/MapWrapper';
import { Sidebar } from './components/Sidebar';
import { SAMPLE_POINTS, SAMPLE_POLYGONS, SAMPLE_LINES } from './constants';
import { FeatureCollection } from 'geojson';
import { ToolType, AnalysisResult } from './types';
import { performAnalysis } from './services/turfService';
import { Activity, Layers, Info, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // We maintain the source datasets
  const [pointsData] = useState<FeatureCollection>(SAMPLE_POINTS);
  const [polygonsData] = useState<FeatureCollection>(SAMPLE_POLYGONS);
  const [linesData] = useState<FeatureCollection>(SAMPLE_LINES);

  // The result layer to display on the map
  const [resultLayer, setResultLayer] = useState<FeatureCollection | null>(null);

  const handleToolSelect = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    setAnalysisResult(null);
    setResultLayer(null);
  }, []);

  const handleRunAnalysis = useCallback(async (params?: any) => {
    if (!activeTool) return;
    setIsProcessing(true);

    try {
      // Small delay to allow UI to update processing state
      await new Promise(resolve => setTimeout(resolve, 100));

      const { geoJSON, metadata } = performAnalysis(
        activeTool, 
        pointsData, 
        polygonsData, 
        linesData, 
        params
      );

      setResultLayer(geoJSON || null);
      setAnalysisResult(metadata || null);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analiz başarısız oldu (Analysis failed). Konsolu kontrol edin.");
    } finally {
      setIsProcessing(false);
    }
  }, [activeTool, pointsData, polygonsData, linesData]);

  // Determine which layers should be visible based on active tool
  const layerVisibility = useMemo(() => {
    // Default: Show all if no tool selected
    if (!activeTool) return { points: true, polygons: true, lines: true };

    const tool = activeTool;
    
    // Default state for analysis mode
    let points = false;
    let polygons = false;
    let lines = false;

    // --- GEOMETRIC ---
    if (['AREA', 'BBOX', 'CENTROID'].includes(tool)) {
        polygons = true;
    }
    if (tool === 'BEARING') points = true;

    // --- SPATIAL REL / VECTOR OPS ---
    if (['INTERSECT', 'UNION', 'DIFFERENCE', 'DISSOLVE', 'CLIP'].includes(tool)) {
        polygons = true; // Operations are mostly on polygons
    }
    if (tool === 'SPATIAL_JOIN') {
        points = true;
        polygons = true;
    }

    // --- ANALYTICAL ---
    if (tool === 'BUFFER') {
        // Hiding base layers because result contains the buffered features + original features
        points = false;
        polygons = false;
        lines = false;
    }
    if (['VORONOI', 'CONVEX_HULL', 'TIN', 'NEAREST', 'DISTANCE_MATRIX'].includes(tool)) {
        points = true; // For Isochrones we need the start point visible
    }
    if (tool === 'BASE_STATION_COVERAGE') {
        points = false; // We create specific stations in the analysis
    }
    if (['KMEANS', 'DBSCAN'].includes(tool)) {
        points = false; // Result layer shows the clusters
    }

    // --- TRANSFORM ---
    if (tool === 'POLYGON_TO_LINE') polygons = true;
    if (tool === 'SIMPLIFY') {
        // Special case: We hide originals because the result returns both Original(Ghost) and Simplified for comparison
        polygons = false; 
        lines = false;
    }
    if (tool === 'LINE_TO_POLYGON') lines = true;

    // --- NETWORK ---
    if (['LINE_INTERSECT', 'BEZIER', 'LENGTH', 'LINE_CHUNK', 'LINE_OFFSET'].includes(tool)) {
        lines = true;
    }
    if (tool === 'SNAP') {
        lines = true;
        points = true;
    }

    // --- DENSITY/GRID ---
    if (['HEXBIN', 'ISOBANDS', 'IDW'].includes(tool)) {
        points = true; // Show source points
    }
    if (['POINT_GRID', 'SQUARE_GRID', 'TRIANGLE_GRID', 'HEX_GRID'].includes(tool)) {
        polygons = true;
    }

    // --- DATA GEN (SECTOR, ELLIPSE, RANDOM) ---
    if (['SECTOR', 'ELLIPSE'].includes(tool)) {
        points = true; // Show center points as reference
    }
    if (['RANDOM_POINT', 'RANDOM_LINE', 'RANDOM_POLYGON'].includes(tool)) {
        points = false; polygons = false; lines = false;
    }

    // --- BOOLEAN (TOPOLOGY) ---
    if (tool === 'BOOL_POINT_IN_POLY' || tool === 'BOOL_CONTAINS') {
        points = true; polygons = true;
    }
    if (tool === 'BOOL_CROSSES') {
        lines = true; polygons = true;
    }
    if (tool === 'BOOL_DISJOINT' || tool === 'BOOL_OVERLAP' || tool === 'BOOL_EQUAL' || tool === 'BOOL_TOUCH' || tool === 'BOOL_INTERSECTS') {
        polygons = true;
    }

    return { points, polygons, lines };
  }, [activeTool]);

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden">
      {/* Sidebar for Tools */}
      <Sidebar 
        activeTool={activeTool} 
        onSelectTool={handleToolSelect} 
        onRunAnalysis={handleRunAnalysis}
        isProcessing={isProcessing}
      />

      {/* Main Map Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Header / Stats Bar */}
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-6 justify-between shadow-md z-10">
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-400 w-5 h-5" />
            <h1 className="font-semibold text-slate-100">GeoReact CBS Analisti (GIS Analyst)</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
             <div className={`flex items-center gap-2 transition-opacity duration-300 ${layerVisibility.points ? 'opacity-100' : 'opacity-30'}`}>
               <Layers className="w-4 h-4" />
               <span>{pointsData.features.length} Nokta (Points)</span>
             </div>
             <div className={`flex items-center gap-2 transition-opacity duration-300 ${layerVisibility.polygons ? 'opacity-100' : 'opacity-30'}`}>
               <Layers className="w-4 h-4" />
               <span>{polygonsData.features.length} Poligon (Polygons)</span>
             </div>
             <div className={`flex items-center gap-2 transition-opacity duration-300 ${layerVisibility.lines ? 'opacity-100' : 'opacity-30'}`}>
               <Layers className="w-4 h-4" />
               <span>{linesData.features.length} Çizgi (Lines)</span>
             </div>
          </div>
        </header>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-950">
          <MapWrapper 
            points={pointsData}
            polygons={polygonsData}
            lines={linesData}
            resultLayer={resultLayer}
            visibleLayers={layerVisibility}
          />

          {/* Analysis Result Overlay - Bottom Right */}
          {analysisResult && (
            <div className="absolute bottom-8 right-4 bg-slate-800/95 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-2xl max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 z-20 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  Analiz Sonuçları (Results)
                </h3>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <div className="space-y-2 text-sm">
                {analysisResult.message && (
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">{analysisResult.message}</p>
                )}
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  {analysisResult.stats && Object.entries(analysisResult.stats).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-800/50 last:border-0">
                      <span className="text-slate-400 capitalize pr-2">{key}</span>
                      <span className="font-mono text-emerald-400 font-semibold text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;