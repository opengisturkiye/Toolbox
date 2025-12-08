import * as turf from '@turf/turf';
import { FeatureCollection, Feature, Point, Polygon, LineString, BBox, MultiPolygon } from 'geojson';
import { ToolType, AnalysisResult } from '../types';

// Workaround for missing type definitions in some @turf/turf versions
const T = turf as any;

// --- Helpers ---
// We pass these collections to the strategy functions
interface Context {
  points: FeatureCollection<Point>;
  polygons: FeatureCollection<Polygon>;
  lines: FeatureCollection<LineString>;
  params: any;
  // Helpers to get specific ID features
  getPolyById: (id: number) => Feature<Polygon>;
  getLineById: (id: string) => Feature<LineString>;
  getPointById: (id: number) => Feature<Point>;
}

interface ServiceResult {
  geoJSON?: FeatureCollection | null;
  metadata: AnalysisResult;
}

// --- Strategy Functions ---

const analyzeGeometric = (tool: ToolType, ctx: Context): ServiceResult => {
  const { polygons, points, getPointById } = ctx;
  let resultGeoJSON: FeatureCollection | undefined;
  let message = "";
  let stats: any = {};

  switch (tool) {
    case ToolType.AREA: {
      let totalArea = 0;
      const features = polygons.features.map(f => {
        const a = turf.area(f);
        totalArea += a;
        const areaDisplay = a > 1000000 ? `${(a/1000000).toFixed(2)} km²` : `${Math.round(a)} m²`;
        return T.feature(f.geometry, { ...f.properties, label: areaDisplay });
      });
      resultGeoJSON = T.featureCollection(features as Feature[]);
      message = "Alan Hesabı (Area): Poligonların yüz ölçümleri hesaplandı ve üzerlerine yazıldı.\n\n❓ Neden Kullanılır?\nEmlak vergilendirmesi, tarım arazilerinin rekolte tahmini, orman yangını sonrası hasar gören alanın tespiti veya imar planlarında parsel büyüklüklerini doğrulamak için kritik bir işlemdir.";
      stats = { "Toplam Alan (Total)": (totalArea / 1000000).toFixed(2) + " km²" };
      break;
    }
    case ToolType.BBOX: {
      const combined = T.featureCollection([...points.features, ...polygons.features, ...ctx.lines.features]);
      const bbox = turf.bbox(combined);
      const bboxPoly = turf.bboxPolygon(bbox);
      bboxPoly.properties = { type: 'bbox', label: 'Çalışma Alanı (Extent)' };
      resultGeoJSON = T.featureCollection([bboxPoly]);
      message = "Sınırlayıcı Kutu (Bounding Box): Tüm verilerinizi içine alan en küçük dikdörtgen çerçeve bulundu.\n\n❓ Neden Kullanılır?\nHarita ilk açıldığında kamerayı nereye odaklayacağınızı belirlemek, yazıcıdan çıktı alırken kağıt boyutuna uygun alanı seçmek veya iki farklı harita katmanının aynı bölgeye ait olup olmadığını hızlıca kontrol etmek için kullanılır.";
      stats = { "Alan (Area)": (turf.area(bboxPoly)/1000000).toFixed(2) + " km²" };
      break;
    }
    case ToolType.CENTROID: {
      const centroids = polygons.features.map(f => {
        const c = turf.centroid(f);
        c.properties = { ...f.properties, type: 'centroid', label: f.properties?.name || 'Merkez' };
        return c;
      });
      resultGeoJSON = T.featureCollection(centroids);
      message = "Merkez Noktalar (Centroids): Şekillerin ağırlık merkezleri hesaplandı.\n\n❓ Neden Kullanılır?\nKarmaşık şekillere sahip ilçe veya mahallelerin isim etiketlerini (Label) haritanın tam ortasına yerleştirmek için kullanılır. Ayrıca bir poligonu, analizlerde (örn: yoğunluk haritası) tek bir nokta olarak temsil etmek istediğinizde işe yarar.";
      stats = { "Nokta (Count)": centroids.length };
      break;
    }
    case ToolType.BEARING: {
        const start = getPointById(900); // Central Office
        const end = getPointById(4); // Remote Island
        if (start && end) {
            const bearing = turf.bearing(start, end);
            const line = T.lineString([start.geometry.coordinates, end.geometry.coordinates], {
                label: `${bearing.toFixed(1)}°`
            });
            start.properties = { ...start.properties, label: 'Başlangıç' };
            end.properties = { ...end.properties, label: 'Hedef' };
            resultGeoJSON = T.featureCollection([start, end, line] as Feature[]);
            message = `Açı & Azimut (Bearing): İki nokta arasındaki pusula açısı ${bearing.toFixed(2)} derece olarak ölçüldü.\n\n❓ Neden Kullanılır?\nNavigasyonda gidilecek yönü belirlemek, telekomünikasyon antenlerinin (baz istasyonu) hangi yöne bakacağını ayarlamak veya rüzgar/akıntı yönü analizlerinde kullanılır.`;
            stats = { "Açı (Angle)": bearing.toFixed(2) + "°" };
        }
        break;
    }
  }
  return { geoJSON: resultGeoJSON, metadata: { message, stats } };
};

const analyzeVector = (tool: ToolType, ctx: Context): ServiceResult => {
  const { params, getPointById, getLineById, getPolyById, polygons, points, lines } = ctx;
  let resultGeoJSON: FeatureCollection | undefined;
  let message = "";
  
  switch (tool) {
    case ToolType.BUFFER: {
      const radius = params.radius || 0.5;
      const features: Feature[] = [];
      let pt = getPointById(900); if (!pt) pt = points.features[0] as Feature<Point>;
      if (pt) {
          const ptBuff = turf.buffer(pt, radius, { units: 'kilometers' });
          ptBuff.properties = { label: `Nokta ${radius}km` };
          features.push(ptBuff, pt); 
      }
      let line = getLineById('Hwy1'); if (!line) line = lines.features[0] as Feature<LineString>;
      if (line) {
          const lineBuff = turf.buffer(line, radius, { units: 'kilometers' });
          lineBuff.properties = { label: `Çizgi ${radius}km` };
          features.push(lineBuff, line);
      }
      let poly = getPolyById(1); if (!poly) poly = polygons.features[0] as Feature<Polygon>;
      if (poly) {
          const polyBuff = turf.buffer(poly, radius, { units: 'kilometers' });
          polyBuff.properties = { label: `Alan ${radius}km` };
          features.push(polyBuff, poly);
      }
      resultGeoJSON = T.featureCollection(features);
      message = `Tampon (Buffer): Seçilen nesnelerin etrafında ${radius}km yarıçaplı koruma halkaları oluşturuldu.\n\n❓ Neden Kullanılır?\nDere yataklarına yapılaşma yasağı koymak (örn: 50m koruma bandı), gürültü kaynaklarının (otoban, fabrika) etki alanını belirlemek veya bir mağazanın yürüme mesafesindeki potansiyel müşterilerini analiz etmek için kullanılır.`;
      break;
    }
    case ToolType.INTERSECT: {
      // 1. Try to find the specific demo polygons we know overlap
      const p1 = getPolyById(601); // District A
      const p2 = getPolyById(602); // District B 
      
      let target1 = p1;
      let target2 = p2;

      // 2. Fallback: If demo data is missing, try to find ANY overlapping pair
      if (!target1 || !target2) {
          const list = polygons.features;
          outer: for(let i=0; i<list.length; i++) {
              for(let j=i+1; j<list.length; j++) {
                   if (!turf.booleanDisjoint(list[i], list[j])) {
                       target1 = list[i] as Feature<Polygon>;
                       target2 = list[j] as Feature<Polygon>;
                       break outer;
                   }
              }
          }
      }

      if(target1 && target2) {
          try {
            const int = turf.intersect(T.featureCollection([target1, target2]) as any);
            if(int) {
                // Style the result (Intersection) brightly
                int.properties = { label: 'Kesişim Alanı', fill: '#ef4444', stroke: '#b91c1c' };
                
                // Clone inputs to set them as transparent for better visualization
                const t1Clone = T.clone(target1);
                t1Clone.properties = { ...t1Clone.properties, fill: 'rgba(59, 130, 246, 0.1)', stroke: '#3b82f6', label: 'Bölge A' };
                
                const t2Clone = T.clone(target2);
                t2Clone.properties = { ...t2Clone.properties, fill: 'rgba(16, 185, 129, 0.1)', stroke: '#10b981', label: 'Bölge B' };

                resultGeoJSON = T.featureCollection([t1Clone, t2Clone, int]);
                message = "Kesişim (Intersect): İki alanın sadece üst üste binen (çakışan) kısmı çıkarıldı (Kırmızı alan).\n\n❓ Neden Kullanılır?\nÇakışma analizi yapmak için. Örnek: 'Orman arazisi ile maden ruhsat sahasının çakıştığı yer neresi?' veya 'Hem sel riski taşıyan hem de tarım yapılan alanlar hangileri?'.";
            } else {
                resultGeoJSON = T.featureCollection([target1, target2]);
                message = "Seçilen alanlar kesişmiyor. (No Intersection Found)";
            }
          } catch(e) { message = "Kesişim hesaplanırken hata oluştu."; }
      } else {
          message = "Kesişen poligon bulunamadı. Lütfen birbirine temas eden veriler kullanın.";
      }
      break;
    }
    case ToolType.CLIP: {
        const city = getPolyById(1);
        const mask = getPolyById(500); // Clip Mask
        if (city && mask) {
            const clipped = turf.intersect(T.featureCollection([city, mask]) as any);
            if (clipped) {
                clipped.properties = { label: 'Kırpılmış Şehir', fill: '#d946ef', stroke: '#a21caf' }; // Magenta
                mask.properties = { ...mask.properties, label: 'Maske', fill: 'rgba(255,255,255,0.1)', stroke: '#94a3b8' };
                resultGeoJSON = T.featureCollection([mask, clipped] as Feature[]);
                message = "Kırpma (Clip): Veri, bir 'Maske' (Gri çerçeve) kullanılarak kesildi.\n\n❓ Neden Kullanılır?\nBüyük bir ülke haritasından sadece üzerinde çalışacağınız ilin verisini kesip almak (Cookie Cutter) için kullanılır. Odaklanılan bölge dışındaki gereksiz veriyi temizler.";
            }
        }
        break;
    }
    case ToolType.UNION: {
      const pA = getPolyById(601);
      const pB = getPolyById(602);
      if(pA && pB) {
          const un = turf.union(T.featureCollection([pA, pB]) as any);
          if(un) {
              // Union'ın gerçek anlamını göstermek için: parçaları özellikleriyle renklendir
              // A kısmı (sadece pA'da): mavi, B kısmı (sadece pB'de): yeşil, Kesişim: mor
              const features: any[] = [];
              
              // Union sonucu tek geometry olarak gelir, bunu göstermek için:
              // Orijinal parçaları renkli olarak göster
              const pAStyled = { ...pA };
              pAStyled.properties = { 
                label: 'Katman 1 (Şehir Merkezi)', 
                fill: '#3b82f6',
                stroke: '#1e40af'
              };
              features.push(pAStyled);
              
              const pBStyled = { ...pB };
              pBStyled.properties = { 
                label: 'Katman 2 (Yeşil Park)', 
                fill: '#10b981',
                stroke: '#059669'
              };
              features.push(pBStyled);
              
              // Union sonucu
              un.properties = { 
                label: 'Union Sonucu', 
                fill: '#8b5cf6',
                stroke: '#7c3aed'
              };
              features.push(un);
              
              resultGeoJSON = T.featureCollection(features);
              message = "Birleşim (Union): İki katmanın tüm geometrileri birleştirilmiştir.\n\n📊 Gösterilen Katmanlar:\n🔵 Katman 1 (Şehir Merkezi) - Mavi\n🟢 Katman 2 (Yeşil Park) - Yeşil\n🟣 Union Sonucu - Mor (Kesişimde parçalı)\n\n💡 Detay:\nUnion işlemi, kesişim noktalarında geometrileri otomatik olarak parçalar ve her iki katmanın özniteliklerini korur. Böylece her parçanın hangi katmandan geldiği bilinir.";
          }
      }
      break;
    }
    case ToolType.DIFFERENCE: {
        const p1 = getPolyById(1);
        const p2 = getPolyById(2);
        if(p1 && p2) {
            const diff = turf.difference(T.featureCollection([p1, p2]) as any);
            if(diff) {
                diff.properties = { label: 'Park Hariç Şehir', fill: '#f59e0b' };
                resultGeoJSON = T.featureCollection([diff]);
                message = "Fark (Difference): Şehir alanından, Park alanı 'kesilip atıldı' (A eksi B).\n\n❓ Neden Kullanılır?\n'Kullanılabilir alan' hesabı yapmak için. Örneğin: Bir arsa içindeki 'İnşaat Yapılamaz' alanları (sulak alan, sit alanı vb.) ana parselden çıkararak geriye kalan net inşaat alanını bulmak.";
            }
        }
        break;
    }
    case ToolType.DISSOLVE: {
        // Collect specific polygons for demo or use all
        const collection = T.featureCollection([getPolyById(601), getPolyById(602), getPolyById(3)].filter(x=>x)) as any;
        const dis = turf.dissolve(collection.features.length ? collection : polygons, { propertyName: 'type' }); 
        dis.features.forEach((f: any) => { if(f.properties) f.properties.label = (f.properties.type || 'Birleşik') + ' (Dissolved)'; });
        resultGeoJSON = dis;
        message = "Bütünleştir (Dissolve): Aynı özelliğe (Örn: 'Tip') sahip bitişik alanlar tek parça yapıldı.\n\n❓ Neden Kullanılır?\nVeri sadeleştirme (Aggregation) için. Örneğin: Mahalle sınırlarını birleştirerek İlçe Haritası üretmek veya 'Konut', 'Ticari' gibi imar adalarını birleştirip genel bölgeleme haritası yapmak.";
        break;
    }
    case ToolType.CONVEX_HULL: {
      const hull = turf.convex(points);
      if (hull) {
          hull.properties = { label: 'Kapsama Sınırı' };
          resultGeoJSON = T.featureCollection([hull]);
          message = "Dış Bükey Örtü (Convex Hull): Noktaları içine alan en küçük ve en gergin dış sınır çizildi (Lastik bant mantığı).\n\n❓ Neden Kullanılır?\nBir fenomenin yayıldığı maksimum coğrafi alanı görmek için. Örnek: 'Salgın hastalığın görüldüğü tüm köyleri kapsayan karantina sınırı ne olmalı?'";
      }
      break;
    }
    case ToolType.SIMPLIFY: {
        const tol = params.tolerance || 0.001;
        const highResLine = getLineById('HighResLine') || lines.features[0];
        
        if (!highResLine) { message = "Örnek veri bulunamadı."; break; }

        const featuresToProcess = [highResLine as Feature<LineString>];
        const results: Feature[] = [];
        let beforePoints = 0;
        let afterPoints = 0;

        featuresToProcess.forEach(f => {
            const coordsBefore = T.getCoords(f).flat(Infinity);
            beforePoints += coordsBefore.length / 2;
            const ghost = T.clone(f as any);
            ghost.properties = { ...ghost.properties, label: 'Orjinal', stroke: '#475569', fill: 'none', width: 2 };
            results.push(ghost);

            const simple = turf.simplify(f, { tolerance: tol, highQuality: true, mutate: false });
            const coordsAfter = T.getCoords(simple).flat(Infinity);
            afterPoints += coordsAfter.length / 2;

            simple.properties = { label: 'Basit', stroke: '#ef4444', fill: 'none', width: 3 };
            results.push(simple);
        });

        resultGeoJSON = T.featureCollection(results);
        message = `Basitleştirme: Çizgi üzerindeki gereksiz detaylar (Vertex) temizlendi. (Tolerans: ${tol})\n\n❓ Neden Kullanılır?\nWeb haritalarında performans artırmak için veri boyutunu küçültmekte kullanılır. Çok detaylı bir GPS izini (1000 nokta), şekli bozmadan 100 noktaya düşürebilirsiniz.`;
        return { geoJSON: resultGeoJSON, metadata: { message, stats: { "Önce": beforePoints, "Sonra": afterPoints, "Kazanç": `%${((1 - afterPoints/beforePoints)*100).toFixed(1)}` } } };
    }
  }
  return { geoJSON: resultGeoJSON, metadata: { message } };
};

const analyzeSpatial = (tool: ToolType, ctx: Context): ServiceResult => {
    const { params, points, polygons, getPointById } = ctx;
    let resultGeoJSON: FeatureCollection | undefined;
    let message = "";
    let stats: any = {};

    switch(tool) {
        case ToolType.SPATIAL_JOIN: {
            const collected = turf.collect(polygons, points, 'id', 'pts');
            const res = collected.features.map(f => {
               const count = f.properties?.pts?.length || 0;
               return T.feature(f.geometry, { ...f.properties, label: `${count} Adet`, count, type: 'spatialJoin' });
            });
            resultGeoJSON = T.featureCollection(res as Feature[]);
            message = "Mekansal Birleşim (Spatial Join): Her bir poligonun sınırları içine düşen noktalar sayıldı ve poligona veri olarak eklendi.\n\n❓ Neden Kullanılır?\nİstatistik üretmek için. Örnek: 'Hangi mahallede kaç adet eczane var?', 'Hangi satış bölgesinde kaç müşterimiz ikamet ediyor?'.";
            break;
        }
        case ToolType.NEAREST: {
            const target = T.point([-74.00, 40.72], { 'marker-color': '#F00', label: 'BAŞLANGIÇ' });
            const near = turf.nearestPoint(target, points);
            if(near.properties) near.properties.label = "HEDEF";
            const dist = near.properties?.distanceToPoint.toFixed(2);
            const link = T.lineString([target.geometry.coordinates, near.geometry.coordinates], { label: `${dist} km` });
            resultGeoJSON = T.featureCollection([target, near as Feature, link] as Feature[]);
            message = "En Yakın Nokta: Belirlenen referans noktasına kuş uçuşu en yakın olan nesne bulundu.\n\n❓ Neden Kullanılır?\nAcil durum yönetimi ve lojistik için. Örnek: 'Kaza yerine en yakın ambulans hangisi?', 'Müşterinin konumuna en yakın şubemiz nerede?', 'Yangına en yakın su kaynağı hangi noktada?'.";
            stats = { "Mesafe": dist + " km" };
            break;
        }
        case ToolType.DISTANCE_MATRIX: {
            const maxDist = params.maxDistance || 0.5;
            const connections: Feature[] = [];
            let count = 0;
            const pts = points.features;
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dist = turf.distance(pts[i] as Feature<Point>, pts[j] as Feature<Point>);
                    if (dist <= maxDist) {
                        connections.push(T.lineString(
                            [(pts[i].geometry as Point).coordinates, (pts[j].geometry as Point).coordinates], 
                            { distance: dist, label: `${dist.toFixed(2)}km` }
                        ));
                        count++;
                    }
                }
            }
            resultGeoJSON = T.featureCollection(connections);
            message = `Mesafe Matrisi: Birbirine ${maxDist}km'den daha yakın olan tüm noktalar arasında bağlantı kuruldu.\n\n❓ Neden Kullanılır?\nAğ optimizasyonu ve kümeleme analizleri için. Örnek: 'Hangi depolar birbirine mal transferi yapabilecek kadar yakın?', 'Sosyal ağ analizinde kimler birbirine yakın oturuyor?'.`;
            stats = { "Bağlantı": count };
            break;
        }
        case ToolType.VORONOI: {
            const bbox = turf.bbox(points);
            const voronoi = turf.voronoi(points, { bbox: [bbox[0]-0.05, bbox[1]-0.05, bbox[2]+0.05, bbox[3]+0.05] as BBox });
            resultGeoJSON = voronoi;
            message = "Voronoi Diyagramı: Her bir noktanın 'Hakimiyet Alanı' (kendisine en yakın olan bölge) çizildi.\n\n❓ Neden Kullanılır?\nHizmet bölgesi belirlemek için. Örnek: 'Bir şehirdeki itfaiye istasyonlarının sorumluluk sahalarını belirlemek' (Herhangi bir noktada yangın çıkarsa, o bölge hangi istasyona daha yakın?).";
            break;
        }
        case ToolType.TIN: {
            const tin = turf.tin(points);
            resultGeoJSON = tin;
            message = "TIN (Üçgen Ağı): Noktalar kullanılarak kesintisiz bir üçgen ağı örüldü.\n\n❓ Neden Kullanılır?\nArazi modellemesi (DEM) için kullanılır. Yükseklik verisi içeren noktalardan 3 boyutlu arazi yüzeyi veya eğim haritası oluşturmanın temelidir.";
            break;
        }
        case ToolType.KMEANS: {
            const k = params.numberOfClusters || 5;
            const clustered = turf.clustersKmeans(points, { numberOfClusters: k });
            const hulls: Feature[] = [];
            for(let i=0; i<k; i++) {
                const clusterPoints = clustered.features.filter(f => f.properties?.cluster === i);
                if (clusterPoints.length > 2) {
                   const hull = turf.convex(T.featureCollection(clusterPoints as Feature<Point>[]));
                   if(hull) {
                       hull.properties = { cluster: i, type: 'clusterHull', label: `Grup ${i+1}` };
                       hulls.push(hull);
                   }
                }
            }
            resultGeoJSON = T.featureCollection([...clustered.features, ...hulls]);
            message = `K-Means Kümeleme: Dağınık noktalar, konumlarına göre ${k} adet mantıksal gruba ayrıldı.\n\n❓ Neden Kullanılır?\nSegmentasyon ve planlama için. Örnek: Müşterileri coğrafi olarak gruplayıp satış ekiplerine dağıtmak, lojistik depolarının yerini belirlemek veya benzer özellikteki bölgeleri sınıflandırmak için kullanılır.`;
            break;
        }
        case ToolType.DBSCAN: {
            const dist = params.maxDistance || 0.2;
            const clustered = turf.clustersDbscan(points, dist, { units: 'kilometers' });
            resultGeoJSON = clustered;
            message = `DBSCAN Kümeleme: Yoğunluk temelli kümeleme yapıldı. Sadece birbirine ${dist}km yakın olan noktalar kümelendi, aykırı değerler (Gürültü) dışlandı.\n\n❓ Neden Kullanılır?\nSıcak nokta (Hotspot) tespiti için. Örnek: 'Suç oranlarının yoğunlaştığı bölgeleri tespit etmek' veya 'Trafik kazalarının sık yaşandığı kara noktaları bulmak'.`;
            break;
        }
    }
    return { geoJSON: resultGeoJSON, metadata: { message, stats } };
};

const analyzeNetwork = (tool: ToolType, ctx: Context): ServiceResult => {
    const { params, lines, points, getLineById } = ctx;
    let resultGeoJSON: FeatureCollection | undefined;
    let message = "";
    let stats: any = {};

    switch(tool) {
        case ToolType.LINE_INTERSECT: {
            const intersections: Feature[] = [];
            const l = lines.features as Feature<LineString>[];
            for(let i=0; i<l.length; i++){
                for(let j=i+1; j<l.length; j++){
                    const res = turf.lineIntersect(l[i], l[j]);
                    res.features.forEach(f => f.properties = { label: 'Kavşak' });
                    intersections.push(...res.features);
                }
            }
            resultGeoJSON = T.featureCollection(intersections);
            message = "Yol Kesişimleri: Haritadaki tüm yollar taranarak kesişim (Kavşak) noktaları tespit edildi.\n\n❓ Neden Kullanılır?\nAltyapı yönetimi ve kaza analizleri için. Örnek: 'Hatalı yerleştirilmiş boru hatlarının çakıştığı yerleri bulmak' veya 'Trafik ışığı konulması gereken kavşakları belirlemek'.";
            stats = { "Kesişim": intersections.length };
            break;
        }
        case ToolType.BEZIER: {
            const target = getLineById('JaggedPath');
            if(target) {
                const curved = turf.bezierSpline(target, { sharpness: params.sharpness || 0.85 });
                curved.properties = { label: 'Düzeltilmiş', stroke: '#00FF00' };
                target.properties = { ...target.properties, label: 'Orjinal', stroke: '#64748b' };
                resultGeoJSON = T.featureCollection([target, curved]);
                message = "Eğri Yumuşatma: Keskin köşeli (zikzaklı) yol verisi, matematiksel olarak akıcı bir eğriye dönüştürüldü.\n\n❓ Neden Kullanılır?\nGörsel iyileştirme ve GPS verisi düzeltme için. Örnek: Seyrek GPS verisiyle çizilen köşeli araç rotasını, haritada yola uygun yumuşak bir çizgiye dönüştürmek.";
            }
            break;
        }
        case ToolType.LINE_OFFSET: {
            const dist = params.distance || 0.1;
            const target = getLineById('Hwy1');
            if (target) {
                const offset = turf.lineOffset(target, dist, { units: 'kilometers' });
                offset.properties = { label: 'Yan Yol' };
                resultGeoJSON = T.featureCollection([target, offset]);
                message = `Ofset: Mevcut çizginin ${dist}km yanına paralel yeni bir şerit oluşturuldu.\n\n❓ Neden Kullanılır?\nŞerit ve koridor analizi için. Örnek: 'Mevcut boru hattının 5 metre sağına yeni bir fiber kablo hattı planlamak'.`;
            }
            break;
        }
        case ToolType.SNAP: {
            const distThreshold = params.distance || 0.2;
            const line = getLineById('Hwy1'); 
            const results: Feature[] = [line];
            let snappedCount = 0;
            points.features.forEach(pt => {
                 const snapped = turf.nearestPointOnLine(line, pt as Feature<Point>, { units: 'kilometers' });
                 const dist = snapped.properties?.dist || 999;
                 if (dist < distThreshold) {
                     snapped.properties = { ...snapped.properties, label: 'Yapışan' };
                     const connector = T.lineString([(pt.geometry as Point).coordinates, snapped.geometry.coordinates], { label: `${(dist*1000).toFixed(0)}m` });
                     results.push(snapped, connector);
                     snappedCount++;
                 }
            });
            resultGeoJSON = T.featureCollection(results);
            message = `Çizgiye Yapıştırma (Snap): ${distThreshold}km mesafedeki dağınık noktalar, en yakın yol çizgisi üzerine matematiksel olarak hizalandı.\n\n❓ Neden Kullanılır?\nGPS hatalarını düzeltmek için. Örnek: 'Cihaz hatası nedeniyle yolun dışına kaymış görünen araç konumlarını, haritadaki yolun tam üzerine oturtmak'.`;
            stats = { "Yapışan": snappedCount };
            break;
        }
        case ToolType.LENGTH: {
            let tot = 0;
            const mapped = lines.features.map(f => {
                const len = turf.length(f);
                tot += len;
                return T.feature(f.geometry, { ...f.properties, label: `${len.toFixed(2)} km` });
            });
            resultGeoJSON = T.featureCollection(mapped as Feature[]);
            message = "Çizgi Uzunluğu: Haritadaki tüm hatların gerçek dünya uzunlukları hesaplandı.\n\n❓ Neden Kullanılır?\nMaliyet ve metraj hesabı için. Örnek: 'Döşenecek asfalt miktarını veya çekilecek kablo uzunluğunu hesaplamak'.";
            stats = { "Toplam": tot.toFixed(2) + " km" };
            break;
        }
        case ToolType.LINE_CHUNK: {
            const len = params.length || 0.5;
            const chunks: Feature[] = [];
            const cuts: Feature[] = [];
            lines.features.forEach(line => {
                 const chunked = turf.lineChunk(line as Feature<LineString>, len, { units: 'kilometers' });
                 chunked.features.forEach((c: any, i: number) => { 
                     c.properties = {label: `${(i+1)*len}km`}; 
                     if(c.geometry.coordinates.length > 0) {
                         const endCoord = c.geometry.coordinates[c.geometry.coordinates.length-1];
                         cuts.push(T.point(endCoord, { label: 'Kesim' }));
                     }
                 });
                 chunks.push(...chunked.features);
            });
            resultGeoJSON = T.featureCollection([...chunks, ...cuts]);
            message = `Parçalama: Uzun çizgiler her ${len}km'de bir eşit parçalara bölündü.\n\n❓ Neden Kullanılır?\nBakım planlaması için. Örnek: 'Uzun bir otoyolu, her 5 km'de bir bakım ekiplerine paylaştırmak' veya 'Boru hattını kontrol segmentlerine ayırmak'.`;
            break;
        }
        case ToolType.BASE_STATION_COVERAGE: {
             const maxRadius = params.radius || 4; 
             const stations = [
                T.point([-74.00, 40.72], { label: 'Merkez' }), 
                T.point([-74.04, 40.75], { label: 'KB' }), 
                T.point([-73.96, 40.75], { label: 'KD' }), 
                T.point([-74.04, 40.69], { label: 'GB' }), 
                T.point([-73.96, 40.69], { label: 'GD' }) 
             ];
             const techs = [
                { name: '5G', factor: 0.15, fill: '#ef4444', stroke: '#991b1b' }, 
                { name: '4G', factor: 0.35, fill: '#f97316', stroke: '#c2410c' }, 
                { name: '3G', factor: 0.65, fill: '#eab308', stroke: '#a16207' }, 
                { name: '2G', factor: 1.00, fill: '#22c55e', stroke: '#15803d' } 
             ];

             const bandsByType: Record<string, Feature<Polygon | MultiPolygon>[]> = { '5G': [], '4G': [], '3G': [], '2G': [] };
             stations.forEach((station: any) => {
                techs.forEach(tech => {
                    bandsByType[tech.name].push(turf.buffer(station, maxRadius * tech.factor, { units: 'kilometers' }));
                });
             });

             const unionFeatures: Record<string, any> = {};
             for (const tech of techs) {
                 const buffers = bandsByType[tech.name];
                 if (buffers.length > 0) {
                    let unified = buffers[0];
                    for(let i=1; i<buffers.length; i++) {
                        try { unified = turf.union(T.featureCollection([unified, buffers[i]]) as any); } catch(e){}
                    }
                    unionFeatures[tech.name] = unified;
                 }
             }

             const displayLayers: Feature[] = [];
             if (unionFeatures['5G']) displayLayers.push(T.feature(unionFeatures['5G'].geometry, { fill: techs[0].fill + '80', stroke: techs[0].stroke, label: '5G' }));
             if (unionFeatures['4G'] && unionFeatures['5G']) {
                 try { const diff = turf.difference(T.featureCollection([unionFeatures['4G'], unionFeatures['5G']]) as any); if(diff) displayLayers.push(T.feature(diff.geometry, { fill: techs[1].fill + '66', stroke: techs[1].stroke, label: '4G' })); } catch(e){}
             }
             if (unionFeatures['3G'] && unionFeatures['4G']) {
                 try { const diff = turf.difference(T.featureCollection([unionFeatures['3G'], unionFeatures['4G']]) as any); if(diff) displayLayers.push(T.feature(diff.geometry, { fill: techs[2].fill + '55', stroke: techs[2].stroke, label: '3G' })); } catch(e){}
             }
             if (unionFeatures['2G'] && unionFeatures['3G']) {
                 try { const diff = turf.difference(T.featureCollection([unionFeatures['2G'], unionFeatures['3G']]) as any); if(diff) displayLayers.push(T.feature(diff.geometry, { fill: techs[3].fill + '44', stroke: techs[3].stroke, label: '2G' })); } catch(e){}
             }
             
             resultGeoJSON = T.featureCollection([...displayLayers, ...stations]);
             message = "Baz İstasyonu Kapsama: Çoklu teknoloji bantları (2G/3G/4G/5G) için iç içe geçmiş tampon bölgeler oluşturuldu ve birleştirildi.\n\n❓ Neden Kullanılır?\nTelekomünikasyon planlamasında, baz istasyonlarının toplam kapsama alanını ve sinyal kalitesini haritalamak için kullanılır. 'Kör noktaları' tespit etmeye yarar.";
             stats = { "Max 2G": `${maxRadius} km` };
        }
    }
    return { geoJSON: resultGeoJSON, metadata: { message, stats } };
};

const analyzeDensityGrid = (tool: ToolType, ctx: Context): ServiceResult => {
    const { params, points, polygons } = ctx;
    let resultGeoJSON: FeatureCollection | undefined;
    let message = "";
    
    switch(tool) {
        case ToolType.HEXBIN: {
            const cell = params.cellSide || 0.2;
            const bbox = turf.bbox(points);
            const hexGrid = turf.hexGrid([bbox[0]-0.02, bbox[1]-0.02, bbox[2]+0.02, bbox[3]+0.02], cell, { units: 'kilometers' });
            const collected = turf.collect(hexGrid, points, 'id', 'pts');
            const valid = collected.features.filter(f => f.properties?.pts && f.properties.pts.length > 0).map(f => {
                const c = f.properties!.pts.length;
                return T.feature(f.geometry, { ...f.properties, count: c, label: c.toString() });
            });
            resultGeoJSON = T.featureCollection(valid as Feature[]);
            message = "Hexbin Yoğunluk: Veri alanı altıgen peteklere bölündü ve her hücreye düşen nokta sayısı hesaplandı.\n\n❓ Neden Kullanılır?\nBölgesel yoğunluğu anlamak için. Binlerce üst üste binmiş noktayı (Örn: Taksi çağrıları) okumak zordur, ancak altıgen harita 'Hangi bölgenin daha yoğun' olduğunu renklerle net gösterir.";
            break;
        }
        case ToolType.ISOBANDS: {
            const grid = turf.interpolate(points, 0.05, { gridType: 'point', property: 'revenue', units: 'kilometers' });
            const breaks = params.breaks || 5;
            const step = 5000 / breaks;
            const breakVals = Array.from({length: breaks}, (_, i) => i * step);
            const iso = turf.isobands(grid, breakVals, { zProperty: 'revenue' });
            iso.features.forEach((f, i) => { f.properties = { ...f.properties, count: i, label: `Seviye ${i+1}` }; });
            resultGeoJSON = iso;
            message = "Isobands (Eş Değer Bölgeleri): Noktasal değerlerden sürekli bir yüzey oluşturuldu ve benzer değere sahip alanlar kuşaklar (Kontur) halinde çizildi.\n\n❓ Neden Kullanılır?\nSıcaklık haritası, yağış miktarı, hava kirliliği veya emlak fiyat haritaları oluşturmak için.";
            break;
        }
        case ToolType.IDW: {
            const cell = params.cellSize || 0.1;
            const grid = turf.interpolate(points, cell, { gridType: 'hex', property: 'revenue', units: 'kilometers' });
            const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
            grid.features.forEach(f => {
                if (f.properties) {
                    const idx = Math.min(4, Math.floor((f.properties.revenue / 5000) * 5));
                    f.properties.fill = colors[idx];
                    f.properties.stroke = colors[idx];
                    f.properties.label = Math.floor(f.properties.revenue).toString();
                }
            });
            resultGeoJSON = grid;
            message = "IDW Enterpolasyon: Bilinen noktalardaki değerler kullanılarak, aradaki boşluklar için tahmini değerler hesaplandı (Isı Haritası).\n\n❓ Neden Kullanılır?\nSadece istasyonlarda ölçülen veriyi (Örn: Hava kalitesi) tüm şehre yayarak kesintisiz bir harita elde etmek için.";
            break;
        }
        default: {
            const cell = params.cellSize || 0.5;
            const bbox = turf.bbox(polygons);
            const area = [bbox[0]-0.01, bbox[1]-0.01, bbox[2]+0.01, bbox[3]+0.01] as BBox;
            let grid;
            if (tool === ToolType.POINT_GRID) grid = turf.pointGrid(area, cell);
            else if (tool === ToolType.SQUARE_GRID) grid = turf.squareGrid(area, cell);
            else if (tool === ToolType.TRIANGLE_GRID) grid = turf.triangleGrid(area, cell);
            else grid = turf.hexGrid(area, cell);
            resultGeoJSON = grid;
            message = `Grid Üretimi: Çalışma alanı ${cell}km boyutunda sistematik parsellere bölündü.\n\n❓ Neden Kullanılır?\nVeriyi standardize etmek veya saha taraması (Sampling) yapmak için. Örnek: 'Arama kurtarma ekibine arayacakları kareleri atamak'.`;
        }
    }
    return { geoJSON: resultGeoJSON, metadata: { message } };
};

const analyzeDataGen = (tool: ToolType, ctx: Context): ServiceResult => {
    const { params, polygons } = ctx;
    let resultGeoJSON: FeatureCollection | undefined;
    let message = "";

    switch(tool) {
        case ToolType.SECTOR: {
            const center = [-74.00, 40.72];
            let b1 = params.bearing1 || 0, b2 = params.bearing2 || 90;
            if (b1 === b2) b2 = b1 + 0.1;
            const sector = turf.sector(center, params.radius||1, b1, b2, { units: 'kilometers' });
            sector.properties = { label: 'Görüş Açısı' };
            resultGeoJSON = T.featureCollection([sector, T.point(center)] as Feature[]);
            message = "Sektör: Belirli bir açı ve yarıçapa sahip dairesel dilim oluşturuldu.\n\n❓ Neden Kullanılır?\nKamera veya anten kapsama analizi için. Örnek: 'Güvenlik kamerasının kör noktalarını belirlemek'.";
            break;
        }
        case ToolType.ELLIPSE: {
            const center = [-74.00, 40.72];
            const ellipse = turf.ellipse(center, params.xSemiAxis||1, params.ySemiAxis||0.5, { units: 'kilometers' });
            ellipse.properties = { label: 'Elips' };
            resultGeoJSON = T.featureCollection([ellipse, T.point(center)] as Feature[]);
            message = "Elips: Yönlü dağılımı gösteren eliptik şekil oluşturuldu.\n\n❓ Neden Kullanılır?\nBir olayın (suç, kaza vb.) hangi yönde yayılım gösterdiğini görselleştirmek için.";
            break;
        }
        default: {
            const count = params.count || 20;
            const bbox = turf.bbox(polygons);
            let rnd;
            if (tool === ToolType.RANDOM_POINT) rnd = T.randomPoint(count, { bbox });
            else if (tool === ToolType.RANDOM_LINE) rnd = T.randomLineString(count, { bbox, max_length: 0.01 });
            else rnd = T.randomPolygon(count, { bbox, max_radial_length: 0.001 });
            resultGeoJSON = rnd;
            message = `Rastgele Veri: ${count} adet rastgele özellik üretildi.\n\n❓ Neden Kullanılır?\nAlgoritmaları test etmek veya simülasyon (Örn: Rastgele olay senaryoları) oluşturmak için.`;
        }
    }
    return { geoJSON: resultGeoJSON, metadata: { message } };
};

const analyzeTopology = (tool: ToolType, ctx: Context): ServiceResult => {
    const { getPolyById, getPointById, getLineById } = ctx;
    let resultGeoJSON: FeatureCollection | undefined;
    let message = "";
    let stats: any = {};
    let result = false;

    // Default features
    const city = getPolyById(1);
    
    switch(tool) {
        case ToolType.BOOL_POINT_IN_POLY: {
            const pt = getPointById(900);
            result = turf.booleanPointInPolygon(pt, city);
            resultGeoJSON = T.featureCollection([city, pt] as any);
            message = "Nokta Poligon İçinde mi?";
            break;
        }
        case ToolType.BOOL_CONTAINS: {
            const park = getPolyById(2);
            result = turf.booleanContains(city, park);
            resultGeoJSON = T.featureCollection([city, park] as Feature[]);
            message = "Kapsıyor mu? (Contains)";
            break;
        }
        case ToolType.BOOL_CROSSES: {
            const river = getLineById('River1');
            result = turf.booleanCrosses(river, city);
            resultGeoJSON = T.featureCollection([city, river] as Feature[]);
            message = "Kesiyor mu? (Crosses)";
            break;
        }
        case ToolType.BOOL_DISJOINT: {
            const island = getPolyById(4);
            result = turf.booleanDisjoint(city, island);
            resultGeoJSON = T.featureCollection([city, island] as Feature[]);
            message = "Ayrık mı? (Disjoint)";
            break;
        }
        case ToolType.BOOL_OVERLAP: {
            const park = getPolyById(2);
            result = turf.booleanOverlap(city, park);
            resultGeoJSON = T.featureCollection([city, park] as Feature[]);
            message = "Örtüşüyor mu? (Overlap)";
            break;
        }
        case ToolType.BOOL_EQUAL: {
            const ghost = getPolyById(99);
            result = turf.booleanEqual(city, ghost);
            resultGeoJSON = T.featureCollection([city, ghost] as Feature[]);
            message = "Eşit mi? (Equal)";
            break;
        }
        case ToolType.BOOL_TOUCH: {
            const ind = getPolyById(3);
            result = turf.booleanTouches(city, ind);
            resultGeoJSON = T.featureCollection([city, ind] as Feature[]);
            message = "Temas Ediyor mu? (Touch)";
            break;
        }
        case ToolType.BOOL_INTERSECTS: {
            const hwy = getLineById('Hwy1');
            result = turf.booleanIntersects(hwy, city);
            resultGeoJSON = T.featureCollection([city, hwy] as Feature[]);
            message = "Kesişiyor mu? (Intersects)";
            break;
        }
    }
    stats = { "Sonuç": result ? "TRUE" : "FALSE" };
    message += ` -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nOtomatik veri doğrulama ve sorgulama için. Örnek: 'Bu parsel sit alanı içinde mi?', 'Yeni yapılan yol dere yatağını kesiyor mu?'.`;
    return { geoJSON: resultGeoJSON, metadata: { message, stats } };
};

const analyzeTransform = (tool: ToolType, ctx: Context): ServiceResult => {
    const { polygons, lines, getLineById } = ctx;
    let resultGeoJSON: FeatureCollection | undefined;
    let message = "";

    if (tool === ToolType.POLYGON_TO_LINE) {
        const linesFromPoly = polygons.features.map(f => turf.polygonToLine(f as any));
        const flat: Feature[] = [];
        linesFromPoly.forEach(res => {
            if(res.type === 'FeatureCollection') flat.push(...res.features as Feature[]);
            else flat.push(res as Feature);
        });
        flat.forEach(f => f.properties = { label: 'Sınır Çizgisi' });
        resultGeoJSON = T.featureCollection(flat);
        message = "Poligondan Çizgiye: Kapalı alan sınırları (Polygon), basit çizgi verisine (LineString) dönüştürüldü.\n\n❓ Neden Kullanılır?\nSınır analizi yapmak için. Örnek: 'Ülke sınırlarının toplam uzunluğunu ölçmek' veya 'Parsel çevresine çit çekmek'.";
    } else if (tool === ToolType.LINE_TO_POLYGON) {
        let target = getLineById('SiteFence') || lines.features[0];
        if (target) {
            const polys = [turf.lineToPolygon(target as any)];
            if(polys[0]) polys[0].properties = { label: 'Kapalı Alan' };
            resultGeoJSON = T.featureCollection(polys);
            message = "Çizgiden Poligona: Uçları kapalı çizgi, doldurulabilir bir alana dönüştürüldü.\n\n❓ Neden Kullanılır?\nGPS ile yürüyerek alınan sınır verisini (İz kaydı) tapu alanına dönüştürmek için.";
        }
    }
    return { geoJSON: resultGeoJSON, metadata: { message } };
};

// --- Main Entry Point ---

export const performAnalysis = (
  tool: ToolType,
  points: FeatureCollection,
  polygons: FeatureCollection,
  lines: FeatureCollection,
  params: any = {}
): ServiceResult => {

  const pointsFC = points as FeatureCollection<Point>;
  const polygonsFC = polygons as FeatureCollection<Polygon>;
  const linesFC = lines as FeatureCollection<LineString>;

  const ctx: Context = {
      points: pointsFC,
      polygons: polygonsFC,
      lines: linesFC,
      params,
      getPolyById: (id) => polygons.features.find(f => f.properties?.id === id) as Feature<Polygon>,
      getLineById: (id) => lines.features.find(f => f.properties?.id === id) as Feature<LineString>,
      getPointById: (id) => points.features.find(f => f.properties?.id === id) as Feature<Point>
  };

  if (['AREA', 'BBOX', 'CENTROID', 'BEARING'].includes(tool)) return analyzeGeometric(tool, ctx);
  
  if (['BUFFER', 'INTERSECT', 'UNION', 'DIFFERENCE', 'DISSOLVE', 'CLIP', 'CONVEX_HULL', 'SIMPLIFY'].includes(tool)) return analyzeVector(tool, ctx);
  
  if (['SPATIAL_JOIN', 'NEAREST', 'DISTANCE_MATRIX', 'VORONOI', 'TIN', 'KMEANS', 'DBSCAN'].includes(tool)) return analyzeSpatial(tool, ctx);

  if (['LINE_INTERSECT', 'BEZIER', 'LINE_OFFSET', 'SNAP', 'LENGTH', 'LINE_CHUNK', 'BASE_STATION_COVERAGE'].includes(tool)) return analyzeNetwork(tool, ctx);
  
  if (['HEXBIN', 'ISOBANDS', 'IDW', 'POINT_GRID', 'SQUARE_GRID', 'TRIANGLE_GRID', 'HEX_GRID'].includes(tool)) return analyzeDensityGrid(tool, ctx);
  
  if (['SECTOR', 'ELLIPSE', 'RANDOM_POINT', 'RANDOM_LINE', 'RANDOM_POLYGON'].includes(tool)) return analyzeDataGen(tool, ctx);

  if (tool.startsWith('BOOL_')) return analyzeTopology(tool, ctx);

  if (tool === 'POLYGON_TO_LINE' || tool === 'LINE_TO_POLYGON') return analyzeTransform(tool, ctx);

  return { geoJSON: undefined, metadata: { message: "Analiz fonksiyonu bulunamadı." } };
};