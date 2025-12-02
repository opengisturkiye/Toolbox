import { useMemo } from 'react';
import { ToolType } from '../types';

export const useLayerVisibility = (activeTool: ToolType | null) => {
  return useMemo(() => {
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
        points = true;
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
};