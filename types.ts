import { FeatureCollection } from 'geojson';

export enum ToolType {
  // Geometric
  AREA = 'AREA',
  BBOX = 'BBOX',
  CENTROID = 'CENTROID',
  
  // Spatial Relationships
  INTERSECT = 'INTERSECT',
  UNION = 'UNION',
  DIFFERENCE = 'DIFFERENCE',
  SPATIAL_JOIN = 'SPATIAL_JOIN', // Points in Polygons
  DISSOLVE = 'DISSOLVE',
  
  // Analytical
  BUFFER = 'BUFFER',
  VORONOI = 'VORONOI',
  CONVEX_HULL = 'CONVEX_HULL',
  TIN = 'TIN',
  KMEANS = 'KMEANS',
  DBSCAN = 'DBSCAN', 
  NEAREST = 'NEAREST',
  
  // Transformation
  POLYGON_TO_LINE = 'POLYGON_TO_LINE',
  LINE_TO_POLYGON = 'LINE_TO_POLYGON',
  SIMPLIFY = 'SIMPLIFY',
  CLIP = 'CLIP', // New

  // Network / Linear
  LINE_INTERSECT = 'LINE_INTERSECT',
  BEZIER = 'BEZIER',
  LENGTH = 'LENGTH',
  LINE_CHUNK = 'LINE_CHUNK',
  DISTANCE_MATRIX = 'DISTANCE_MATRIX',
  LINE_OFFSET = 'LINE_OFFSET', // New
  SNAP = 'SNAP', // New
  
  // Density / Grids
  HEXBIN = 'HEXBIN',
  ISOBANDS = 'ISOBANDS',
  IDW = 'IDW', // New (Interpolation)
  POINT_GRID = 'POINT_GRID',
  SQUARE_GRID = 'SQUARE_GRID',
  TRIANGLE_GRID = 'TRIANGLE_GRID',
  HEX_GRID = 'HEX_GRID',

  // Topological Boolean
  BOOL_POINT_IN_POLY = 'BOOL_POINT_IN_POLY',
  BOOL_CONTAINS = 'BOOL_CONTAINS',
  BOOL_CROSSES = 'BOOL_CROSSES',
  BOOL_DISJOINT = 'BOOL_DISJOINT',
  BOOL_OVERLAP = 'BOOL_OVERLAP',
  BOOL_EQUAL = 'BOOL_EQUAL',
  BOOL_TOUCH = 'BOOL_TOUCH',
  BOOL_INTERSECTS = 'BOOL_INTERSECTS',
  
  // Measurement & Visualization (New Categories logic)
  BEARING = 'BEARING', // New
  SECTOR = 'SECTOR', // New
  ELLIPSE = 'ELLIPSE', // New

  // Random Data
  RANDOM_POINT = 'RANDOM_POINT',
  RANDOM_LINE = 'RANDOM_LINE',
  RANDOM_POLYGON = 'RANDOM_POLYGON',
}

export interface AnalysisResult {
  message?: string;
  stats?: Record<string, string | number>;
  geoJSON?: FeatureCollection | null; // The visual result to put on the map
}

export interface ToolDefinition {
  id: ToolType;
  label: string;
  category: string;
  description: string;
  requiresParams?: boolean;
}