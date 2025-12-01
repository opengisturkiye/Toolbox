import { FeatureCollection, Feature, LineString } from 'geojson';

// Helper to generate a noisy high-detail line for Simplify demo
const generateNoisyLine = (): Feature<LineString> => {
  const coords = [];
  for (let i = 0; i <= 100; i++) {
    // A sine wave with random jitter
    const x = -74.03 + (i * 0.0006); // Longitude progression
    const baseFreq = Math.sin(i * 0.3) * 0.003;
    const noise = (Math.random() - 0.5) * 0.001; // Jitter
    const y = 40.73 + baseFreq + noise;
    coords.push([x, y]);
  }
  return {
    type: "Feature",
    properties: { id: "HighResLine", name: "Yüksek Detaylı Sinyal (High Detail)", traffic: "Test" },
    geometry: {
      type: "LineString",
      coordinates: coords
    }
  };
};

// 1. Polygons
export const SAMPLE_POLYGONS: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: 1, name: "Şehir Merkezi (City)", type: "Kentsel", population: 50000 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.02, 40.70], 
          [-74.00, 40.70], 
          [-73.99, 40.71], 
          [-73.99, 40.73], 
          [-74.01, 40.735], 
          [-74.025, 40.72], 
          [-74.02, 40.70]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: 2, name: "Yeşil Park (Park)", type: "Park", population: 0 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.005, 40.715], 
          [-73.98, 40.715], 
          [-73.98, 40.74], 
          [-74.005, 40.74], 
          [-74.005, 40.715]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: 3, name: "Sanayi Bölgesi (Ind. Zone)", type: "Sanayi", population: 500 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.02, 40.70], 
          [-74.025, 40.72], 
          [-74.04, 40.72], 
          [-74.04, 40.70], 
          [-74.02, 40.70]
        ]]
      }
    },
    {
        type: "Feature",
        properties: { id: 4, name: "Uzak Ada (Remote Is.)", type: "Ada", population: 100 },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-74.04, 40.74], 
            [-74.03, 40.74], 
            [-74.03, 40.75], 
            [-74.04, 40.75], 
            [-74.04, 40.74]
          ]]
        }
    },
    // Detailed polygon for Simplify Demo (Rough Coast)
    {
      type: "Feature",
      properties: { id: 777, name: "Girintili Kıyı (Rough Coast)", type: "Doğal" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-73.97, 40.75], 
          [-73.968, 40.752], [-73.966, 40.751], [-73.965, 40.753], 
          [-73.963, 40.752], [-73.962, 40.755], [-73.960, 40.753],
          [-73.958, 40.756], [-73.955, 40.754], [-73.952, 40.758],
          [-73.95, 40.75], 
          [-73.96, 40.745], [-73.965, 40.748],
          [-73.97, 40.75]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: 99, name: "Hayalet Katman (Ghost Layer)", type: "Kopya", population: 50000 },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.02, 40.70], 
          [-74.00, 40.70], 
          [-73.99, 40.71], 
          [-73.99, 40.73], 
          [-74.01, 40.735], 
          [-74.025, 40.72], 
          [-74.02, 40.70]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: 500, name: "Kırpma Maskesi (Clip Mask)", type: "Maske" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-74.03, 40.71], 
          [-74.01, 40.71], 
          [-74.01, 40.73], 
          [-74.03, 40.73], 
          [-74.03, 40.71]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: 601, name: "Bölge A (District A)", type: "Konut" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-73.98, 40.70],
          [-73.96, 40.70],
          [-73.96, 40.71],
          [-73.98, 40.71],
          [-73.98, 40.70]
        ]]
      }
    },
    {
      type: "Feature",
      properties: { id: 602, name: "Bölge B (District B)", type: "Konut" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-73.98, 40.71],
          [-73.96, 40.71],
          [-73.96, 40.72],
          [-73.98, 40.72],
          [-73.98, 40.71]
        ]]
      }
    }
  ]
};

// 2. Points
const generatePoints = (): FeatureCollection => {
  const features: any[] = [];
  
  // Cluster in City Center
  for (let i = 0; i < 40; i++) {
    const lng = -74.02 + Math.random() * 0.025; 
    const lat = 40.70 + Math.random() * 0.03;
    features.push({
      type: "Feature",
      properties: { id: i, type: "Mağaza", revenue: Math.floor(Math.random() * 5000) },
      geometry: { type: "Point", coordinates: [lng, lat] }
    });
  }

  // Specific point INSIDE city
  features.push({
      type: "Feature",
      properties: { id: 900, type: "Merkez Ofis", revenue: 5000 },
      geometry: { type: "Point", coordinates: [-74.01, 40.71] }
  });

  // Scattered points near Highway for SNAP testing
  [
    [-74.03, 40.722], // Near Hwy start
    [-74.01, 40.718], // Below Hwy
    [-73.99, 40.723], // Above Hwy
    [-73.97, 40.719], // Near End
    [-74.02, 40.721]  // Close
  ].forEach((coord, idx) => {
    features.push({
      type: "Feature",
      properties: { id: 800+idx, type: "Dağınık", revenue: 1000 },
      geometry: { type: "Point", coordinates: coord }
    });
  });

  // Linear distribution
  for (let i = 0; i < 10; i++) {
      const lng = -74.005;
      const lat = 40.70 + (i * 0.005);
      features.push({
        type: "Feature",
        properties: { id: 100+i, type: "Otobüs Durağı", revenue: 500 + Math.random() * 500 },
        geometry: { type: "Point", coordinates: [lng, lat] }
      });
  }

  return { type: "FeatureCollection", features };
};

export const SAMPLE_POINTS: FeatureCollection = generatePoints();

// 3. Lines
export const SAMPLE_LINES: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "Hwy1", name: "Ana Otoban (Highway)", traffic: "Yüksek" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.04, 40.72], [-73.96, 40.72] // Horizontal
        ]
      }
    },
    {
      type: "Feature",
      properties: { id: "River1", name: "Nehir (River)", traffic: "Yok" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.01, 40.75], [-74.01, 40.69] // Vertical
        ]
      }
    },
    {
        type: "Feature",
        properties: { id: "Path1", name: "Park Yolu (Path)", traffic: "Düşük" },
        geometry: {
          type: "LineString",
          coordinates: [
            [-74.005, 40.74], [-73.98, 40.715] // Diagonal
          ]
        }
    },
    generateNoisyLine(), // ADDED: High resolution line for Simplify
    {
      type: "Feature",
      properties: { id: "SiteFence", name: "İnşaat Çiti (Site Fence)", traffic: "Kapalı" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.99, 40.69], 
          [-73.98, 40.69], 
          [-73.98, 40.698], 
          [-73.99, 40.698], 
          [-73.99, 40.69]
        ]
      }
    },
    {
      type: "Feature",
      properties: { id: "JaggedPath", name: "Zikzak Yol (ZigZag Path)", traffic: "Orta" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.03, 40.73], 
          [-74.02, 40.74], 
          [-74.01, 40.73], 
          [-74.00, 40.74],
          [-73.99, 40.73]
        ]
      }
    }
  ]
};

export const TOOLS_CONFIG = [
  // 1. Geometric & Measurement
  { id: 'AREA', label: 'Alan Hesapla (Calculate Area)', category: 'Geometrik & Ölçüm (Geometry)', description: 'Emlak ve arazi planlaması için m² veya km² hesaplar.' },
  { id: 'LENGTH', label: 'Çizgi Uzunluğu (Line Length)', category: 'Geometrik & Ölçüm (Geometry)', description: 'Yol, boru hattı veya rotaların toplam mesafesini ölçer.' },
  { id: 'BBOX', label: 'Sınırlayıcı Kutu (Bounding Box)', category: 'Geometrik & Ölçüm (Geometry)', description: 'Verinin kapladığı maksimum coğrafi sınırları bulur.' },
  { id: 'CENTROID', label: 'Merkez Noktalar (Centroids)', category: 'Geometrik & Ölçüm (Geometry)', description: 'Şekillerin ağırlık merkezini bulur. Etiket yerleşimi için idealdir.' },
  { id: 'BEARING', label: 'Açı / Azimut (Bearing)', category: 'Geometrik & Ölçüm (Geometry)', description: 'İki nokta arasındaki pusula yönünü (derece) belirler.', requiresParams: false },

  // 2. Vector Operations (Manipulation)
  { id: 'BUFFER', label: 'Tampon Bölge (Buffer)', category: 'Vektör İşlemleri (Vector Ops)', description: 'Nesne etrafında güvenli bölge veya etki alanı oluşturur.', requiresParams: true },
  { id: 'INTERSECT', label: 'Kesişim (Intersect)', category: 'Vektör İşlemleri (Vector Ops)', description: 'İki alanın sadece çakışan (ortak) kısmını alır.' },
  { id: 'UNION', label: 'Birleşim (Union)', category: 'Vektör İşlemleri (Vector Ops)', description: 'Farklı bölgeleri tek bir yasal sınır haline getirir.' },
  { id: 'DIFFERENCE', label: 'Fark (Difference)', category: 'Vektör İşlemleri (Vector Ops)', description: 'Bir alandan diğerini kesip çıkarır (A eksi B).' },
  { id: 'DISSOLVE', label: 'Bütünleştir (Dissolve)', category: 'Vektör İşlemleri (Vector Ops)', description: 'İç sınırları kaldırarak aynı tip bölgeleri birleştirir.' },
  { id: 'CLIP', label: 'Kırpma (Clip)', category: 'Vektör İşlemleri (Vector Ops)', description: 'Büyük veriyi, belirlenen bir maske (çerçeve) ile keser.', requiresParams: false },
  { id: 'CONVEX_HULL', label: 'Dış Bükey Örtü (Convex Hull)', category: 'Vektör İşlemleri (Vector Ops)', description: 'Dağınık noktaları çevreleyen en küçük poligonu çizer.' },
  { id: 'SIMPLIFY', label: 'Basitleştir (Simplify)', category: 'Vektör İşlemleri (Vector Ops)', description: 'Karmaşık geometrilerin nokta sayısını azaltarak performansı artırır.', requiresParams: true },

  // 3. Spatial Analysis
  { id: 'SPATIAL_JOIN', label: 'Mekansal Birleşim (Spatial Join)', category: 'Mekansal Analiz (Spatial Analysis)', description: 'Hangi poligonun içinde kaç nokta olduğunu sayar.' },
  { id: 'NEAREST', label: 'En Yakın Nokta (Nearest Point)', category: 'Mekansal Analiz (Spatial Analysis)', description: 'Konumunuza en yakın hizmet noktasını bulur.' },
  { id: 'DISTANCE_MATRIX', label: 'Mesafe Matrisi (Dist Matrix)', category: 'Mekansal Analiz (Spatial Analysis)', description: 'Tüm noktalar arasındaki mesafeleri analiz eder.' },
  { id: 'VORONOI', label: 'Voronoi Bölgeleri (Voronoi)', category: 'Mekansal Analiz (Spatial Analysis)', description: 'Her noktanın kendi hakimiyet alanını haritalandırır.' },
  { id: 'TIN', label: 'Üçgen Ağı (TIN)', category: 'Mekansal Analiz (Spatial Analysis)', description: 'Noktalardan 3B arazi modeli için yüzey ağı örer.' },
  { id: 'KMEANS', label: 'K-Means Kümeleme (Clustering)', category: 'Mekansal Analiz (Spatial Analysis)', description: 'Benzer konumdaki noktaları gruplandırır (Segmentasyon).', requiresParams: true },
  { id: 'DBSCAN', label: 'DBSCAN Kümeleme', category: 'Mekansal Analiz (Spatial Analysis)', description: 'Gürültüyü filtreleyerek yoğunluk kümelerini bulur.', requiresParams: true },

  // 4. Network & Line Analysis
  { id: 'LINE_INTERSECT', label: 'Yol Kesişimleri (Intersections)', category: 'Ağ Analizi (Network)', description: 'Yolların kesiştiği kavşak noktalarını tespit eder.' },
  { id: 'BEZIER', label: 'Eğri Yumuşatma (Bezier Spline)', category: 'Ağ Analizi (Network)', description: 'Keskin köşeli çizgileri estetik eğrilere dönüştürür.', requiresParams: true },
  { id: 'LINE_CHUNK', label: 'Parçalara Böl (Line Chunk)', category: 'Ağ Analizi (Network)', description: 'Uzun hatları belirli km aralıklarla segmentlere ayırır.', requiresParams: true },
  { id: 'LINE_OFFSET', label: 'Ofset (Line Offset)', category: 'Ağ Analizi (Network)', description: 'Mevcut hatta paralel yeni bir şerit oluşturur.', requiresParams: true },
  { id: 'SNAP', label: 'Çizgiye Yapıştırma (Snap)', category: 'Ağ Analizi (Network)', description: 'Hatalı GPS noktalarını en yakın yola hizalar.', requiresParams: true },

  // 5. Data Conversion
  { id: 'POLYGON_TO_LINE', label: 'Poligondan Çizgiye (Poly To Line)', category: 'Veri Dönüşümü (Conversion)', description: 'Alan sınırını çizgi verisine çevirir.' },
  { id: 'LINE_TO_POLYGON', label: 'Çizgiden Poligona (Line To Poly)', category: 'Veri Dönüşümü (Conversion)', description: 'Kapalı çizgiyi doldurulabilir alana çevirir.' },

  // 6. Grid & Density
  { id: 'HEXBIN', label: 'Altıgen Yoğunluk (Hexbin)', category: 'Grid & Yoğunluk (Grid & Density)', description: 'Veriyi altıgen peteklerde özetleyerek yoğunluğu gösterir.', requiresParams: true },
  { id: 'ISOBANDS', label: 'Eş Değer Bölgeleri (Isobands)', category: 'Grid & Yoğunluk (Grid & Density)', description: 'Eş yükselti veya sıcaklık eğrileri oluşturur.', requiresParams: true },
  { id: 'IDW', label: 'Enterpolasyon (IDW)', category: 'Grid & Yoğunluk (Grid & Density)', description: 'Örnek noktalardan tahmini yüzey haritası üretir.', requiresParams: true },
  { id: 'POINT_GRID', label: 'Nokta Grid (Point Grid)', category: 'Grid & Yoğunluk (Grid & Density)', description: 'Sahayı düzenli nokta aralıklarıyla tarar.', requiresParams: true },
  { id: 'SQUARE_GRID', label: 'Kare Grid (Square Grid)', category: 'Grid & Yoğunluk (Grid & Density)', description: 'Alanı eşit kare parsellere böler.', requiresParams: true },
  { id: 'TRIANGLE_GRID', label: 'Üçgen Grid (Triangle Grid)', category: 'Grid & Yoğunluk (Grid & Density)', description: 'Alanı üçgen ağ yapısına böler.', requiresParams: true },
  { id: 'HEX_GRID', label: 'Altıgen Grid (Hex Grid)', category: 'Grid & Yoğunluk (Grid & Density)', description: 'Alanı bal peteği yapısına böler.', requiresParams: true },

  // 7. Topological Queries
  { id: 'BOOL_POINT_IN_POLY', label: 'Nokta İçinde mi? (PointInPoly)', category: 'Topolojik Sorgular (Topology)', description: 'Konumun yasaklı/izinli bölgede olup olmadığını sorgular.' },
  { id: 'BOOL_CONTAINS', label: 'Kapsıyor mu? (Contains)', category: 'Topolojik Sorgular (Topology)', description: 'Bir alanın diğerini tamamen içine alıp almadığını kontrol eder.' },
  { id: 'BOOL_CROSSES', label: 'Kesiyor mu? (Crosses)', category: 'Topolojik Sorgular (Topology)', description: 'Çizgisel varlıkların (nehir, yol) kesişim durumunu kontrol eder.' },
  { id: 'BOOL_DISJOINT', label: 'Ayrık mı? (Disjoint)', category: 'Topolojik Sorgular (Topology)', description: 'İki nesnenin birbirinden tamamen bağımsız olup olmadığına bakar.' },
  { id: 'BOOL_OVERLAP', label: 'Örtüşüyor mu? (Overlap)', category: 'Topolojik Sorgular (Topology)', description: 'İki alanın kısmen üst üste binip binmediğini kontrol eder.' },
  { id: 'BOOL_EQUAL', label: 'Eşit mi? (Equal)', category: 'Topolojik Sorgular (Topology)', description: 'İki geometrinin mekansal olarak birebir aynı olup olmadığına bakar.' },
  { id: 'BOOL_TOUCH', label: 'Temas Ediyor mu? (Touch)', category: 'Topolojik Sorgular (Topology)', description: 'Sadece sınır komşuluğu olup olmadığını kontrol eder.' },
  { id: 'BOOL_INTERSECTS', label: 'Kesişiyor mu? (Intersects)', category: 'Topolojik Sorgular (Topology)', description: 'Nesneler arasında herhangi bir temas veya çakışma var mı?' },

  // 8. Data Generation & Visualization
  { id: 'SECTOR', label: 'Sektör (Sector)', category: 'Veri Üretimi (Data Gen)', description: 'Kamera veya radar görüş açısını temsil eden dilim çizer.', requiresParams: true },
  { id: 'ELLIPSE', label: 'Elips (Ellipse)', category: 'Veri Üretimi (Data Gen)', description: 'Yönlü dağılımı göstermek için elips çizer.', requiresParams: true },
  { id: 'RANDOM_POINT', label: 'Rastgele Nokta (Random Pt)', category: 'Veri Üretimi (Data Gen)', description: 'Simülasyonlar için rastgele nokta verisi üretir.', requiresParams: true },
  { id: 'RANDOM_LINE', label: 'Rastgele Çizgi (Random Line)', category: 'Veri Üretimi (Data Gen)', description: 'Test amaçlı rastgele çizgi ağları üretir.', requiresParams: true },
  { id: 'RANDOM_POLYGON', label: 'Rastgele Poligon (Random Poly)', category: 'Veri Üretimi (Data Gen)', description: 'Test amaçlı rastgele parseller üretir.', requiresParams: true },
] as const;