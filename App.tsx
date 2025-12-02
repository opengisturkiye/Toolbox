import React, { useState, useCallback } from 'react';
import { MapWrapper } from './components/MapWrapper';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ResultsPanel } from './components/ResultsPanel';
import { SAMPLE_POINTS, SAMPLE_POLYGONS, SAMPLE_LINES } from './constants';
import { ToolType, AnalysisResult } from './types';
import { performAnalysis } from './services/turfService';
import { useLayerVisibility } from './hooks/useLayerVisibility';
import { FeatureCollection } from 'geojson';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data (Static from constants)
  const pointsData: FeatureCollection = SAMPLE_POINTS;
  const polygonsData: FeatureCollection = SAMPLE_POLYGONS;
  const linesData: FeatureCollection = SAMPLE_LINES;

  // Result Layer
  const [resultLayer, setResultLayer] = useState<FeatureCollection | null>(null);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  // Custom Hook for Visibility Logic
  const layerVisibility = useLayerVisibility(activeTool);

  const handleToolSelect = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    setAnalysisResult(null);
    setResultLayer(null);
    // Note: We don't close sidebar here automatically on mobile, 
    // user might need to see tool selection or parameters.
  }, []);

  const handleRunAnalysis = useCallback(async (params?: any) => {
    if (!activeTool) return;
    setIsProcessing(true);

    try {
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

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden flex-col lg:flex-row">
      {/* Sidebar - Responsive */}
      <Sidebar 
        activeTool={activeTool} 
        onSelectTool={handleToolSelect} 
        onRunAnalysis={handleRunAnalysis}
        isProcessing={isProcessing}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header 
            counts={{
                points: pointsData.features.length,
                polygons: polygonsData.features.length,
                lines: linesData.features.length
            }}
            visibleLayers={layerVisibility}
            onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Map */}
        <div className="flex-1 relative bg-slate-950">
          <MapWrapper 
            points={pointsData}
            polygons={polygonsData}
            lines={linesData}
            resultLayer={resultLayer}
            visibleLayers={layerVisibility}
          />
          <ResultsPanel 
            result={analysisResult} 
            onClose={() => setAnalysisResult(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default App;