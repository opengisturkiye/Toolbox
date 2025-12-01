import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { FeatureCollection } from 'geojson';
import { fromLonLat } from 'ol/proj';
import { FullScreen, Zoom } from 'ol/control';

interface MapWrapperProps {
  points: FeatureCollection;
  polygons: FeatureCollection;
  lines: FeatureCollection;
  resultLayer: FeatureCollection | null;
  visibleLayers: {
    points: boolean;
    polygons: boolean;
    lines: boolean;
  };
}

export const MapWrapper: React.FC<MapWrapperProps> = ({ points, polygons, lines, resultLayer, visibleLayers }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, text: string } | null>(null);

  // Source references
  const pointsSourceRef = useRef(new VectorSource());
  const polygonsSourceRef = useRef(new VectorSource());
  const linesSourceRef = useRef(new VectorSource());
  const resultSourceRef = useRef(new VectorSource());

  // Layer references for visibility toggling
  const pointsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const polygonsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const linesLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    // Styles
    const polygonStyle = new Style({
      stroke: new Stroke({ color: '#3b82f6', width: 2 }), // Blue-500
      fill: new Fill({ color: 'rgba(59, 130, 246, 0.1)' }),
    });

    const pointStyle = new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#ef4444' }), // Red-500
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
      }),
    });

    const lineStyle = new Style({
      stroke: new Stroke({ color: '#f59e0b', width: 4 }), // Amber-500
    });

    const resultStyle = (feature: any) => {
        const props = feature.getProperties();
        const geometryType = feature.getGeometry().getType();
        
        // Base Style Configuration
        let baseStyle: Style;

        // 1. K-MEANS CLUSTERING COLORING
        if (props.cluster !== undefined && props.type !== 'clusterHull') {
             const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0'];
             const clusterColor = colors[props.cluster % colors.length] || '#ffffff';
             
             baseStyle = new Style({
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({ color: clusterColor }),
                    stroke: new Stroke({ color: '#fff', width: 2 }),
                }),
                text: new Text({
                    text: `K${props.cluster}`,
                    fill: new Fill({ color: '#fff' }),
                    stroke: new Stroke({ color: '#000', width: 3 }),
                    offsetY: -12
                })
             });
             return baseStyle;
        }

        // 2. GENERIC RESULT STYLING WITH OVERRIDES (Fill/Stroke)
        if (props.type === 'clusterHull') {
            const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0'];
            const clusterColor = colors[(props.cluster || 0) % colors.length] || '#ffffff';
            baseStyle = new Style({
                stroke: new Stroke({ color: clusterColor, width: 3 }),
                fill: new Fill({ color: clusterColor + '33' }),
            });
        } else if (props.fill || props.stroke) {
            // Support explicit color overrides (e.g. from IDW or Clip)
            baseStyle = new Style({
                stroke: new Stroke({ color: props.stroke || '#10b981', width: 3 }),
                fill: new Fill({ color: props.fill || 'rgba(16, 185, 129, 0.3)' }),
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({ color: props.stroke || '#10b981' }),
                    stroke: new Stroke({ color: '#fff', width: 2 }),
                }),
            });
        } else if (props.count !== undefined && props.type !== 'spatialJoin') {
            // Hexbin density ramp (fallback if no explicit fill)
            const opacity = Math.min(0.9, Math.max(0.2, props.count / 8)); 
            baseStyle = new Style({
               stroke: new Stroke({ color: 'rgba(16, 185, 129, 0.8)', width: 2 }),
               fill: new Fill({ color: `rgba(16, 185, 129, ${opacity})` })
            });
        } else {
            // Standard Emerald Style for Results
            baseStyle = new Style({
                stroke: new Stroke({ color: '#10b981', width: 4 }),
                fill: new Fill({ color: 'rgba(16, 185, 129, 0.3)' }),
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({ color: '#10b981' }),
                    stroke: new Stroke({ color: '#fff', width: 2 }),
                }),
            });
        }

        // 3. ADD LABEL IF EXISTS (Area, Length, Count, etc.)
        if (props.label) {
            const textStyle = new Text({
                text: String(props.label),
                font: 'bold 13px "Inter", sans-serif',
                fill: new Fill({ color: '#ffffff' }),
                stroke: new Stroke({ color: '#000000', width: 3 }),
                overflow: true, 
                placement: geometryType === 'LineString' ? 'line' : 'point', 
                textBaseline: 'middle',
                offsetY: geometryType === 'Point' ? -15 : 0, 
            });
            baseStyle.setText(textStyle);
        }

        return baseStyle;
    };

    // Create Layers
    const polygonsLayer = new VectorLayer({
      source: polygonsSourceRef.current,
      style: polygonStyle,
      zIndex: 1,
      visible: true
    });
    polygonsLayerRef.current = polygonsLayer;

    const linesLayer = new VectorLayer({
      source: linesSourceRef.current,
      style: lineStyle,
      zIndex: 2,
      visible: true
    });
    linesLayerRef.current = linesLayer;

    const pointsLayer = new VectorLayer({
      source: pointsSourceRef.current,
      style: pointStyle,
      zIndex: 4,
      visible: true
    });
    pointsLayerRef.current = pointsLayer;

    const resultLayerOl = new VectorLayer({
        source: resultSourceRef.current,
        style: resultStyle,
        zIndex: 5 // Put results on top of everything
    });

    // Initialize Map with Dark Basemap
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
            attributions: '&copy; OpenStreetMap contributors, &copy; CartoDB'
          }),
          className: 'ol-layer-dark'
        }),
        polygonsLayer,
        linesLayer,
        resultLayerOl,
        pointsLayer,
      ],
      view: new View({
        center: fromLonLat([-74.00, 40.72]),
        zoom: 13,
      }),
      controls: [
          new Zoom(),
          new FullScreen()
      ]
    });

    mapRef.current = map;
    
    // Add hover interaction
    map.on('pointermove', (evt) => {
        const feature = map.forEachFeatureAtPixel(evt.pixel, (f, layer) => {
            // Only show hover info for visible layers
            if (layer && layer.getVisible()) return f;
            return null;
        });

        if (feature) {
             const props = feature.getProperties();
             // Simple tooltip text generation
             let text = props.name || props.id || 'Özellik (Feature)';
             // Priority: Label -> Name -> ID
             if (props.label && props.label !== props.count?.toString()) text = props.label; 
             else if (props.name) text = props.name;
             
             // Extra info
             if (props.area_sqm) text += ` (${props.area_sqm} m²)`;
             
             setHoverInfo({
                 x: evt.pixel[0],
                 y: evt.pixel[1],
                 text: String(text)
             });
             mapElement.current!.style.cursor = 'pointer';
        } else {
            setHoverInfo(null);
            mapElement.current!.style.cursor = '';
        }
    });

    return () => map.setTarget(undefined);
  }, []);

  // Update Data Sources
  useEffect(() => {
    if (!mapRef.current) return;
    const format = new GeoJSON({ featureProjection: 'EPSG:3857' });

    pointsSourceRef.current.clear();
    pointsSourceRef.current.addFeatures(format.readFeatures(points));

    polygonsSourceRef.current.clear();
    polygonsSourceRef.current.addFeatures(format.readFeatures(polygons));

    linesSourceRef.current.clear();
    linesSourceRef.current.addFeatures(format.readFeatures(lines));

  }, [points, polygons, lines]);

  // Handle Layer Visibility
  useEffect(() => {
    if (pointsLayerRef.current) pointsLayerRef.current.setVisible(visibleLayers.points);
    if (polygonsLayerRef.current) polygonsLayerRef.current.setVisible(visibleLayers.polygons);
    if (linesLayerRef.current) linesLayerRef.current.setVisible(visibleLayers.lines);
  }, [visibleLayers]);

  // Update Results
  useEffect(() => {
    if (!mapRef.current) return;
    const format = new GeoJSON({ featureProjection: 'EPSG:3857' });
    
    resultSourceRef.current.clear();
    if (resultLayer) {
        resultSourceRef.current.addFeatures(format.readFeatures(resultLayer));
        
        // Zoom to extent of results
        const extent = resultSourceRef.current.getExtent();
        if (!extent.some(isNaN)) {
            // Padding [top, right, bottom, left]
            // Increased bottom padding to 400px to avoid covering by the bottom-right results panel
            mapRef.current.getView().fit(extent, { padding: [50, 50, 400, 50], duration: 1000 });
        }
    }
  }, [resultLayer]);

  return (
    <div className="w-full h-full relative">
        <div ref={mapElement} className="w-full h-full bg-slate-900" />
        
        {/* Simple Tooltip Overlay */}
        {hoverInfo && (
            <div 
                className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px] z-50 whitespace-nowrap border border-white/20"
                style={{ left: hoverInfo.x, top: hoverInfo.y }}
            >
                {hoverInfo.text}
            </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 p-3 rounded text-xs text-slate-300 shadow-lg pointer-events-none z-10">
            {visibleLayers.points && (
              <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
                  <span>Önemli Noktalar (POI/Points)</span>
              </div>
            )}
            {visibleLayers.polygons && (
              <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500/20 border border-blue-500"></div>
                  <span>Bölgeler (Polygons)</span>
              </div>
            )}
            {visibleLayers.lines && (
              <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-1 bg-amber-500"></div>
                  <span>Yol Ağı (Roads)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500/30 border border-emerald-500 border-dashed"></div>
                <span>Analiz Sonucu (Result)</span>
            </div>
        </div>
    </div>
  );
};