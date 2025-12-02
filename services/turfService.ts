import * as turf from '@turf/turf';
import { FeatureCollection, Feature, Point, Polygon, LineString, BBox, MultiPolygon, Geometry } from 'geojson';
import { ToolType, AnalysisResult } from '../types';

export const performAnalysis = (
  tool: ToolType,
  points: FeatureCollection,
  polygons: FeatureCollection,
  lines: FeatureCollection,
  params: any = {}
): { geoJSON: FeatureCollection | undefined, metadata: AnalysisResult } => {

  let resultGeoJSON: FeatureCollection | undefined;
  let stats: any = {};
  let message = "";

  // Cast collections to specific types for strict turf functions
  const pointsFC = points as FeatureCollection<Point>;
  const polygonsFC = polygons as FeatureCollection<Polygon>;
  const linesFC = lines as FeatureCollection<LineString>;

  const getPolyById = (id: number) => polygons.features.find(f => f.properties?.id === id) as Feature<Polygon>;
  const getLineById = (id: string) => lines.features.find(f => f.properties?.id === id) as Feature<LineString>;
  const getPointById = (id: number) => points.features.find(f => f.properties?.id === id) as Feature<Point>;

  switch (tool) {
    case ToolType.AREA: {
      let totalArea = 0;
      const features = polygons.features.map(f => {
        const a = turf.area(f);
        totalArea += a;
        const areaDisplay = a > 1000000 ? `${(a/1000000).toFixed(2)} km²` : `${Math.round(a)} m²`;
        return turf.feature(f.geometry, { ...f.properties, label: areaDisplay });
      });
      resultGeoJSON = turf.featureCollection(features as Feature[]);
      message = "Alan Hesabı (Area): Poligonların yüz ölçümleri hesaplandı ve üzerlerine yazıldı.\n\n❓ Neden Kullanılır?\nEmlak vergilendirmesi, tarım arazilerinin rekolte tahmini, orman yangını sonrası hasar gören alanın tespiti veya imar planlarında parsel büyüklüklerini doğrulamak için kritik bir işlemdir.";
      stats = { "Toplam Alan (Total)": (totalArea / 1000000).toFixed(2) + " km²" };
      break;
    }

    case ToolType.BBOX: {
      const combined = turf.featureCollection([...points.features, ...polygons.features, ...lines.features]);
      const bbox = turf.bbox(combined);
      const bboxPoly = turf.bboxPolygon(bbox);
      bboxPoly.properties = { type: 'bbox', label: 'Çalışma Alanı (Extent)' };
      resultGeoJSON = turf.featureCollection([bboxPoly]);
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
      resultGeoJSON = turf.featureCollection(centroids);
      message = "Merkez Noktalar (Centroids): Şekillerin ağırlık merkezleri hesaplandı.\n\n❓ Neden Kullanılır?\nKarmaşık şekillere sahip ilçe veya mahallelerin isim etiketlerini (Label) haritanın tam ortasına yerleştirmek için kullanılır. Ayrıca bir poligonu, analizlerde (örn: yoğunluk haritası) tek bir nokta olarak temsil etmek istediğinizde işe yarar.";
      stats = { "Nokta (Count)": centroids.length };
      break;
    }
    
    case ToolType.BEARING: {
        const start = getPointById(900); // Central Office
        const end = getPointById(4); // Remote Island
        
        if (start && end) {
            const bearing = turf.bearing(start, end);
            const line = turf.lineString([start.geometry.coordinates, end.geometry.coordinates], {
                label: `${bearing.toFixed(1)}°`
            });
            start.properties = { ...start.properties, label: 'Başlangıç' };
            end.properties = { ...end.properties, label: 'Hedef' };
            resultGeoJSON = turf.featureCollection([start, end, line] as Feature[]);
            message = `Açı & Azimut (Bearing): İki nokta arasındaki pusula açısı ${bearing.toFixed(2)} derece olarak ölçüldü.\n\n❓ Neden Kullanılır?\nNavigasyonda gidilecek yönü belirlemek, telekomünikasyon antenlerinin (baz istasyonu) hangi yöne bakacağını ayarlamak veya rüzgar/akıntı yönü analizlerinde kullanılır.`;
            stats = { "Açı (Angle)": bearing.toFixed(2) + "°" };
        }
        break;
    }

    case ToolType.BUFFER: {
      const radius = params.radius || 0.5;
      const features: Feature[] = [];

      // 1. Point Buffer
      let pt = getPointById(900);
      if (!pt) pt = points.features[0] as Feature<Point>;
      if (pt) {
          const ptBuff = turf.buffer(pt, radius, { units: 'kilometers' });
          ptBuff.properties = { label: `Nokta ${radius}km` };
          features.push(ptBuff);
          features.push(pt); 
      }

      // 2. Line Buffer
      let line = getLineById('Hwy1');
      if (!line) line = lines.features[0] as Feature<LineString>;
      if (line) {
          const lineBuff = turf.buffer(line, radius, { units: 'kilometers' });
          lineBuff.properties = { label: `Çizgi ${radius}km` };
          features.push(lineBuff);
          features.push(line);
      }

      // 3. Polygon Buffer
      let poly = getPolyById(1);
      if (!poly) poly = polygons.features[0] as Feature<Polygon>;
      if (poly) {
          const polyBuff = turf.buffer(poly, radius, { units: 'kilometers' });
          polyBuff.properties = { label: `Alan ${radius}km` };
          features.push(polyBuff);
          features.push(poly);
      }

      resultGeoJSON = turf.featureCollection(features);
      message = `Tampon (Buffer): Seçilen nesnelerin etrafında ${radius}km yarıçaplı koruma halkaları oluşturuldu.\n\n❓ Neden Kullanılır?\nDere yataklarına yapılaşma yasağı koymak (örn: 50m koruma bandı), gürültü kaynaklarının (otoban, fabrika) etki alanını belirlemek veya bir mağazanın yürüme mesafesindeki potansiyel müşterilerini analiz etmek için kullanılır.`;
      break;
    }

    case ToolType.INTERSECT: {
      const pA = getPolyById(601); // District A
      const pB = getPolyById(602); // District B
      
      const p1 = getPolyById(1);
      const p2 = getPolyById(2);

      if(p1 && p2) {
          // Cast feature collection to any to avoid strict type checks in turf.intersect
          const int = turf.intersect(turf.featureCollection([p1, p2]) as any);
          if(int) {
              int.properties = { label: 'Kesişim Alanı', fill: '#ef4444', stroke: '#b91c1c' };
              resultGeoJSON = turf.featureCollection([int, p1, p2]);
              message = "Kesişim (Intersect): Şehir Merkezi ve Yeşil Park'ın sadece üst üste binen (çakışan) kısmı çıkarıldı (Kırmızı alan).\n\n❓ Neden Kullanılır?\nÇakışma analizi yapmak için kullanılır. Örneğin: 'Orman arazisi ile maden ruhsat sahasının çakıştığı yer neresi?' veya 'Hem düz araziye sahip hem de imar izni olan arsalar hangileri?' sorularına cevap verir.";
          }
      }
      break;
    }
    
    case ToolType.CLIP: {
        const city = getPolyById(1);
        const mask = getPolyById(500); // Clip Mask
        
        if (city && mask) {
            // Cast feature collection to any to fix type error
            const clipped = turf.intersect(turf.featureCollection([city, mask]) as any);
            if (clipped) {
                clipped.properties = { label: 'Kırpılmış Şehir', fill: '#d946ef', stroke: '#a21caf' }; // Magenta
                mask.properties = { ...mask.properties, label: 'Maske', fill: 'rgba(255,255,255,0.1)', stroke: '#94a3b8' };
                resultGeoJSON = turf.featureCollection([mask, clipped] as Feature[]);
                message = "Kırpma (Clip): Şehir verisi, bir 'Maske' kullanılarak kesildi. Sadece maskenin içinde kalan kısım (Magenta) alındı.\n\n❓ Neden Kullanılır?\nBüyük bir ülke haritasından sadece üzerinde çalışacağınız ilin verisini kesip almak (Cookie Cutter) ve dosya boyutunu küçültmek için kullanılır.";
            } else {
                message = "Kırpma işlemi başarısız. Maske ve hedef alan kesişmiyor olabilir.";
            }
        }
        break;
    }

    case ToolType.UNION: {
      const pA = getPolyById(601);
      const pB = getPolyById(602);
      if(pA && pB) {
          // Cast feature collection to any to fix type error
          const un = turf.union(turf.featureCollection([pA, pB]) as any);
          if(un) {
              un.properties = { label: 'Birleşmiş Bölge', fill: '#8b5cf6' };
              resultGeoJSON = turf.featureCollection([un]);
              message = "Birleşim (Union): Bitişik iki bölge (District A & B) arasındaki sınır kaldırılarak tek parça yapıldı.\n\n❓ Neden Kullanılır?\nTevhid (parsel birleştirme) işlemlerinde, birden fazla mahalle sınırını birleştirerek yeni bir ilçe sınırı oluşturmakta veya parçalı tarım arazilerini tek bir yönetim birimi olarak ele almak için kullanılır.";
          }
      }
      break;
    }

    case ToolType.DIFFERENCE: {
        const p1 = getPolyById(1);
        const p2 = getPolyById(2);
        if(p1 && p2) {
            // Cast feature collection to any to fix type error
            const diff = turf.difference(turf.featureCollection([p1, p2]) as any);
            if(diff) {
                diff.properties = { label: 'Park Hariç Şehir', fill: '#f59e0b' };
                resultGeoJSON = turf.featureCollection([diff]);
                message = "Fark (Difference): Şehir alanından, Park alanı 'kesilip atıldı' (A eksi B).\n\n❓ Neden Kullanılır?\n'Kullanılabilir alan' hesabı yapmak için. Örneğin: Bir inşaat sahasından, koruma altındaki sit alanlarını veya sulak alanları çıkararak geriye kalan inşaat yapılabilir alanı bulmak için kullanılır.";
            }
        }
        break;
      }
  
    case ToolType.DISSOLVE: {
        const districtCollection = turf.featureCollection([getPolyById(601), getPolyById(602), getPolyById(3)]) as any;
        // Cast to any to assume the return type is correct for FeatureCollection<Polygon>
        const dis = turf.dissolve(districtCollection, { propertyName: 'type' }); 
        dis.features.forEach(f => { if(f.properties) f.properties.label = (f.properties.type || 'Birleşik') + ' (Dissolved)'; });
        resultGeoJSON = dis;
        message = "Bütünleştir (Dissolve): Haritada aynı özelliğe (örn: 'Konut') sahip olan komşu alanların iç sınırları silindi ve birleştirildi.\n\n❓ Neden Kullanılır?\nVeri sadeleştirme (Aggregation) için kullanılır. Örneğin: Mahalle haritasını alıp, mahalleleri birleştirerek 'İlçe Haritası' üretmek veya toprak haritalarında aynı toprak tipine sahip bitişik tarlaları tek poligon yapmak için.";
        break;
    }

    case ToolType.CONVEX_HULL: {
      const hull = turf.convex(pointsFC);
      if (hull) {
          hull.properties = { label: 'Kapsama Sınırı' };
          resultGeoJSON = turf.featureCollection([hull]);
          message = "Dış Bükey Örtü (Convex Hull): Dağınık noktaların hepsini içine alan, lastik bant gibi gerilmiş en küçük dış sınır çizildi.\n\n❓ Neden Kullanılır?\nBir fenomenin yayıldığı maksimum coğrafi alanı görmek için. Örneğin: Bir hayvan sürüsünün otlama sınırlarını, bir salgının görüldüğü bölgeyi veya bir suç serisinin gerçekleştiği alanı tek bir poligonla tanımlamak için.";
      }
      break;
    }

    case ToolType.SPATIAL_JOIN: {
      const collected = turf.collect(polygons, points, 'id', 'pts');
      const res = collected.features.map(f => {
         const count = f.properties?.pts?.length || 0;
         return turf.feature(f.geometry, { ...f.properties, label: `${count} Adet`, count, type: 'spatialJoin' });
      });
      resultGeoJSON = turf.featureCollection(res as Feature[]);
      message = "Mekansal Birleşim (Spatial Join): Noktalar ile Poligonlar konumsal olarak eşleştirildi ve sayım yapıldı.\n\n❓ Neden Kullanılır?\nCBS'nin en temel analizidir. İdari sınırlara göre istatistik üretmek için kullanılır. Örnek: 'Hangi mahallede kaç seçmen var?', 'Hangi ilçede kaç eczane var?', 'Hangi polis bölgesinde kaç suç işlendi?'.";
      break;
    }

    case ToolType.NEAREST: {
        const target = turf.point([-74.00, 40.72], { 'marker-color': '#F00', label: 'BAŞLANGIÇ' });
        const near = turf.nearestPoint(target, pointsFC);
        if(near.properties) near.properties.label = "HEDEF";
        const dist = near.properties?.distanceToPoint.toFixed(2);
        const link = turf.lineString([target.geometry.coordinates, near.geometry.coordinates], { label: `${dist} km` });
        resultGeoJSON = turf.featureCollection([target, near as Feature, link] as Feature[]);
        message = "En Yakın Nokta Analizi: Belirlenen referans noktasına kuş uçuşu en yakın olan nesne bulundu.\n\n❓ Neden Kullanılır?\nAcil durum yönetimi ve lojistik için. Örnek: 'Kaza yerine en yakın ambulans hangisi?', 'Müşterinin konumuna en yakın şubemiz nerede?', 'Yangına en yakın su kaynağı hangi noktada?'.";
        stats = { "Mesafe (Dist)": dist + " km" };
        break;
    }

    case ToolType.DISTANCE_MATRIX: {
        const maxDist = params.maxDistance || 0.5;
        const connections: Feature[] = [];
        let count = 0;
        
        for (let i = 0; i < points.features.length; i++) {
            for (let j = i + 1; j < points.features.length; j++) {
                const p1 = points.features[i] as Feature<Point>;
                const p2 = points.features[j] as Feature<Point>;
                const dist = turf.distance(p1, p2);
                
                if (dist <= maxDist) {
                    connections.push(turf.lineString(
                        [p1.geometry.coordinates, p2.geometry.coordinates], 
                        { distance: dist, label: `${dist.toFixed(2)}km` }
                    ));
                    count++;
                }
            }
        }
        resultGeoJSON = turf.featureCollection(connections);
        message = `Mesafe Matrisi: Birbirine ${maxDist}km mesafeden daha yakın olan tüm noktalar arasında bir ağ örüldü.\n\n❓ Neden Kullanılır?\nErişilebilirlik ve ağ analizleri için. Örnek: Sosyal ağ analizi (kim kime yakın?), birbirine yürüme mesafesindeki durakları belirlemek veya lojistik optimizasyonunda (Traveling Salesman Problem) rota maliyetlerini hesaplamak için.`;
        stats = { "Bağlantı (Links)": count };
        break;
    }

    case ToolType.VORONOI: {
      const bbox = turf.bbox(pointsFC);
      const options = { bbox: [bbox[0]-0.05, bbox[1]-0.05, bbox[2]+0.05, bbox[3]+0.05] as BBox };
      const voronoi = turf.voronoi(pointsFC, options);
      if(voronoi) {
          resultGeoJSON = voronoi;
          message = "Voronoi Diyagramı: Harita, noktalara göre 'hakimiyet alanlarına' bölündü.\n\n❓ Neden Kullanılır?\nHizmet bölgesi belirlemek için. Bir Voronoi hücresindeki herhangi bir konum, o hücrenin merkezindeki noktaya diğer tüm noktalardan daha yakındır. Örnek: 'Bu adresteki hasta hangi sağlık ocağına kayıtlı olmalı?', 'Hangi mahalleye hangi kargo şubesi bakmalı?'.";
      }
      break;
    }

    case ToolType.TIN: {
      const tin = turf.tin(pointsFC);
      resultGeoJSON = tin;
      message = "TIN (Üçgen Ağı): Noktalar kullanılarak sürekli bir yüzey ağı (Triangulated Irregular Network) oluşturuldu.\n\n❓ Neden Kullanılır?\nArazi modellemesi için. Yükseklik noktalarından (kot) 3 boyutlu arazi modeli (DEM) oluşturmak, eğim ve bakı haritaları üretmek veya suyun akış yönünü simüle etmek için kullanılır.";
      stats = { "Üçgen (Triangles)": tin.features.length };
      break;
    }

    case ToolType.KMEANS: {
      const k = params.numberOfClusters || 5;
      const clustered = turf.clustersKmeans(pointsFC, { numberOfClusters: k });
      
      const hulls: Feature[] = [];
      for(let i=0; i<k; i++) {
          const clusterPoints = clustered.features.filter(f => f.properties?.cluster === i);
          if (clusterPoints.length > 2) {
             const hull = turf.convex(turf.featureCollection(clusterPoints as Feature<Point>[]));
             if(hull) {
                 hull.properties = { cluster: i, type: 'clusterHull', label: `Grup ${i+1}` };
                 hulls.push(hull);
             }
          }
      }
      
      resultGeoJSON = turf.featureCollection([...clustered.features, ...hulls]);
      message = `K-Means Kümeleme: Dağınık noktalar, konumlarına göre ${k} adet mantıksal gruba ayrıldı.\n\n❓ Neden Kullanılır?\nSegmentasyon ve planlama için. Örnek: Müşterileri coğrafi olarak gruplayıp satış ekiplerine dağıtmak, lojistik depolarının yerini belirlemek veya benzer özellikteki bölgeleri sınıflandırmak için kullanılır.`;
      stats = { "Küme (Clusters)": k };
      break;
    }

    case ToolType.DBSCAN: {
      const dist = params.maxDistance || 0.2;
      const clustered = turf.clustersDbscan(pointsFC, dist, { units: 'kilometers' });
      resultGeoJSON = clustered;
      message = `DBSCAN Kümeleme: Sadece yoğunluğun yüksek olduğu bölgeler kümelendi, aykırı noktalar (gürültü) dışlandı.\n\n❓ Neden Kullanılır?\nSıcak nokta (Hotspot) tespiti için. Örnek: Şehirdeki suçun yoğunlaştığı bölgeleri bulmak veya trafik kazalarının sık yaşandığı kara noktaları tespit etmek. K-Means'ten farkı, her noktayı zorla bir gruba sokmaz, yalnız kalanları 'gürültü' olarak işaretler.`;
      break;
    }

    case ToolType.BASE_STATION_COVERAGE: {
      const maxRadius = params.radius || 4; // User input defines the 2G limit (max coverage)
      
      // Define 5 distinct stations
      const stations = [
          turf.point([-74.00, 40.72], { label: 'Merkez İstasyon' }), // Center
          turf.point([-74.04, 40.75], { label: 'KB İstasyonu' }), // NW
          turf.point([-73.96, 40.75], { label: 'KD İstasyonu' }), // NE
          turf.point([-74.04, 40.69], { label: 'GB İstasyonu' }), // SW
          turf.point([-73.96, 40.69], { label: 'GD İstasyonu' })  // SE
      ];

      // Technology Bands Config
      const techs = [
          { name: '5G', factor: 0.15, fill: '#ef4444', stroke: '#991b1b' }, // Red (Ultra Fast, Short Range)
          { name: '4G', factor: 0.35, fill: '#f97316', stroke: '#c2410c' }, // Orange
          { name: '3G', factor: 0.65, fill: '#eab308', stroke: '#a16207' }, // Yellow
          { name: '2G', factor: 1.00, fill: '#22c55e', stroke: '#15803d' }  // Green (Voice, Long Range)
      ];

      const allFeatures: Feature[] = [...stations];
      const bandsByType: Record<string, Feature<Polygon | MultiPolygon>[]> = {
          '5G': [], '4G': [], '3G': [], '2G': []
      };

      // 1. Generate Buffers for each station and technology
      stations.forEach((station) => {
          techs.forEach(tech => {
              const r = maxRadius * tech.factor;
              const buff = turf.buffer(station, r, { units: 'kilometers' });
              bandsByType[tech.name].push(buff);
          });
      });

      // 2. Union & Difference Logic to create concentric rings (Donuts)
      // Strategy:
      // - Union all stations for a specific tech to create a continuous coverage layer for that tech.
      // - Subtract the smaller tech layer from the larger tech layer to create the visible "band".
      
      const unionFeatures: Record<string, Feature<Polygon | MultiPolygon> | null> = {};

      // Union all circles of the same tech type
      for (const tech of techs) {
          const buffers = bandsByType[tech.name];
          if (buffers.length > 0) {
              let unified: Feature<Polygon | MultiPolygon> | null = buffers[0];
              for (let i = 1; i < buffers.length; i++) {
                  try {
                       // cast to any to fix type issues with turf union
                       if (unified) unified = turf.union(turf.featureCollection([unified, buffers[i]]) as any);
                  } catch(e) { /* ignore topo errors */ }
              }
              unionFeatures[tech.name] = unified;
          }
      }

      // 3. Create display layers (Rings) by subtracting inner layers from outer layers
      // Display order: 2G (Bottom) -> 3G -> 4G -> 5G (Top) doesn't matter if we use rings.
      // 5G = Union5G
      // 4G = Union4G - Union5G
      // 3G = Union3G - Union4G
      // 2G = Union2G - Union3G

      const displayLayers: Feature[] = [];

      // 5G Layer (Core)
      if (unionFeatures['5G']) {
          unionFeatures['5G'].properties = { 
              fill: techs[0].fill + '80', // 50% opacity
              stroke: techs[0].stroke, 
              label: '5G (Ultra)',
              width: 2
          };
          displayLayers.push(unionFeatures['5G']);
      }

      // 4G Layer (Ring)
      if (unionFeatures['4G'] && unionFeatures['5G']) {
          try {
             // cast to any for turf.difference
             const diff = turf.difference(turf.featureCollection([unionFeatures['4G'], unionFeatures['5G']]) as any);
             if (diff) {
                 diff.properties = { fill: techs[1].fill + '66', stroke: techs[1].stroke, label: '4G (LTE)', width: 2 };
                 displayLayers.push(diff);
             }
          } catch(e) {}
      }

      // 3G Layer (Ring)
      if (unionFeatures['3G'] && unionFeatures['4G']) {
          try {
             const diff = turf.difference(turf.featureCollection([unionFeatures['3G'], unionFeatures['4G']]) as any);
             if (diff) {
                 diff.properties = { fill: techs[2].fill + '55', stroke: techs[2].stroke, label: '3G (Geniş)', width: 2 };
                 displayLayers.push(diff);
             }
          } catch(e) {}
      }

      // 2G Layer (Outer Ring)
      if (unionFeatures['2G'] && unionFeatures['3G']) {
          try {
             const diff = turf.difference(turf.featureCollection([unionFeatures['2G'], unionFeatures['3G']]) as any);
             if (diff) {
                 diff.properties = { fill: techs[3].fill + '44', stroke: techs[3].stroke, label: '2G (Temel)', width: 2 };
                 displayLayers.push(diff);
             }
          } catch(e) {}
      }

      resultGeoJSON = turf.featureCollection([...displayLayers, ...stations]);

      message = `Çoklu Bant Baz İstasyonu Analizi:\n5 istasyon için 2G, 3G, 4G ve 5G sinyal bantları simüle edildi.\n\n` + 
                `🔴 5G (${(maxRadius*0.15).toFixed(1)}km): En hızlı veri, en dar alan.\n` +
                `🟠 4G (${(maxRadius*0.35).toFixed(1)}km): Yüksek hızlı mobil veri.\n` +
                `🟡 3G (${(maxRadius*0.65).toFixed(1)}km): Geniş veri kapsama alanı.\n` +
                `🟢 2G (${maxRadius.toFixed(1)}km): Sadece ses, en uzak mesafe.\n\n` +
                `❓ Neden Kullanılır?\nFrekans planlaması için. Düşük frekanslar (2G/800MHz) uzağa giderken, yüksek frekanslar (5G/3500MHz) sönümlenir. Operatörler bu analizi yaparak hangi teknoloji ile nüfusun yüzde kaçını kapsadıklarını hesaplar.`;
      
      stats = { 
          "Maksimum Erişim (2G)": `${maxRadius} km`,
          "Kapsanan Alan (5G)": unionFeatures['5G'] ? `${(turf.area(unionFeatures['5G'])/1000000).toFixed(2)} km²` : '0',
          "Kapsanan Alan (2G)": unionFeatures['2G'] ? `${(turf.area(unionFeatures['2G'])/1000000).toFixed(2)} km²` : '0'
      };
      break;
    }

    case ToolType.LINE_INTERSECT: {
        const intersections = [];
        const l = lines.features as Feature<LineString>[];
        for(let i=0; i<l.length; i++){
            for(let j=i+1; j<l.length; j++){
                const res = turf.lineIntersect(l[i], l[j]);
                res.features.forEach(f => f.properties = { label: 'Kavşak' });
                if(res.features.length) intersections.push(...res.features);
            }
        }
        resultGeoJSON = turf.featureCollection(intersections);
        message = "Yol Kesişimleri: Çizgilerin birbirini kestiği tüm noktalar (kavşaklar) otomatik tespit edildi.\n\n❓ Neden Kullanılır?\nAğ analizi ve altyapı yönetimi için. Örnek: Yol ağındaki kavşak noktalarını (Node) çıkarmak, elektrik hatları ile su borularının çakıştığı riskli bakım noktalarını belirlemek veya trafik kaza analizleri için.";
        stats = { "Kesişim (Count)": intersections.length };
        break;
    }

    case ToolType.BEZIER: {
        const target = getLineById('JaggedPath'); // Changed from 'GPS_Track' to 'JaggedPath'
        if(target) {
            const curved = turf.bezierSpline(target, { sharpness: params.sharpness || 0.85 });
            curved.properties = { label: 'Düzeltilmiş Rota', stroke: '#00FF00' };
            target.properties = { ...target.properties, label: 'Keskin (Orjinal)', stroke: '#64748b' };
            resultGeoJSON = turf.featureCollection([target, curved]);
            message = "Eğri Yumuşatma (Bezier Spline): Keskin köşeli 'Zikzak Yol' verisi, akıcı bir eğriye dönüştürüldü.\n\n❓ Neden Kullanılır?\nGörsel iyileştirme ve veri düzeltme için. Örnek: GPS cihazından gelen titrek (zikzaklı) rota kayıtlarını düzeltmek veya harita çizimlerinde nehir ve yolları daha estetik/organik göstermek için kullanılır.";
        }
        break;
    }
    
    case ToolType.LINE_OFFSET: {
        const dist = params.distance || 0.1;
        const target = getLineById('Hwy1');
        if (target) {
            const offset = turf.lineOffset(target, dist, { units: 'kilometers' });
            offset.properties = { label: 'Yan Yol' };
            resultGeoJSON = turf.featureCollection([target, offset]);
            message = `Ofset (Line Offset): Mevcut çizginin ${dist}km sağına/soluna paralel bir kopya oluşturuldu.\n\n❓ Neden Kullanılır?\nŞerit ve koridor analizi için. Örnek: Bir ana yolun kenarına kaldırım veya bisiklet yolu çizmek, boru hatlarının etrafındaki güvenlik koridorunu (buffer yerine çizgi olarak) belirlemek için kullanılır.`;
        }
        break;
    }

    case ToolType.SNAP: {
        const distThreshold = params.distance || 0.2;
        const line = getLineById('Hwy1'); 
        const results: Feature[] = [line];
        let snappedCount = 0;

        points.features.forEach(pt => {
             const point = pt as Feature<Point>;
             const snapped = turf.nearestPointOnLine(line, point, { units: 'kilometers' });
             const dist = snapped.properties?.dist || 999;
             
             if (dist < distThreshold) {
                 snapped.properties = { ...snapped.properties, label: 'Yapışan' };
                 const connector = turf.lineString([point.geometry.coordinates, snapped.geometry.coordinates], { label: `${(dist*1000).toFixed(0)}m` });
                 results.push(snapped, connector);
                 snappedCount++;
             }
        });
        
        resultGeoJSON = turf.featureCollection(results);
        message = `Çizgiye Yapıştırma (Snap): Yola ${distThreshold}km mesafeden daha yakın olan noktalar, en yakın yol segmentinin üzerine taşındı.\n\n❓ Neden Kullanılır?\nVeri temizliği (Map Matching) için. Örnek: GPS hataları nedeniyle yolun dışına düşen araç konumlarını tekrar yol üzerine oturtmak veya bir trafik kazasını en yakın otoyol kilometresi ile ilişkilendirmek için.`;
        stats = { "Yapışan (Snapped)": snappedCount };
        break;
    }

    case ToolType.LENGTH: {
        let tot = 0;
        const mapped = lines.features.map(f => {
            const len = turf.length(f);
            tot += len;
            return turf.feature(f.geometry, { ...f.properties, label: `${len.toFixed(2)} km` });
        });
        resultGeoJSON = turf.featureCollection(mapped as Feature[]);
        message = "Çizgi Uzunluğu: Haritadaki hatların (yol, nehir) gerçek dünya uzunlukları hesaplandı.\n\n❓ Neden Kullanılır?\nMaliyet ve metraj hesabı için. Örnek: Karayolu asfaltlama maliyeti, fiber optik kablo döşeme metrajı veya yürüyüş parkurlarının uzunluğunu belirlemek için kullanılır.";
        stats = { "Toplam (Total)": tot.toFixed(2) + " km" };
        break;
    }

    case ToolType.LINE_CHUNK: {
        const len = params.length || 0.5;
        const chunks: Feature[] = [];
        const cuts: Feature[] = [];
        lines.features.forEach(line => {
             const chunked = turf.lineChunk(line as Feature<LineString>, len, { units: 'kilometers' });
             chunked.features.forEach((c, i) => { 
                 c.properties = {label: `${(i+1)*len}km`}; 
                 if(c.geometry.coordinates.length > 0) {
                     const endCoord = c.geometry.coordinates[c.geometry.coordinates.length-1];
                     cuts.push(turf.point(endCoord, { label: 'Kesim' }));
                 }
             });
             chunks.push(...chunked.features);
        });
        resultGeoJSON = turf.featureCollection([...chunks, ...cuts]);
        message = `Parçalama (Line Chunk): Uzun çizgiler her ${len}km'de bir kesilerek eşit parçalara ayrıldı.\n\n❓ Neden Kullanılır?\nBakım ve yönetim planlaması için. Örnek: Otoyolları bakım istasyonlarına göre segmentlere ayırmak, demiryolu hatlarında kilometre taşlarını (kilometraj) belirlemek veya uzun bir boru hattını denetim için bölümlere ayırmak.`;
        stats = { "Segment (Count)": chunks.length };
        break;
    }

    case ToolType.POLYGON_TO_LINE: {
        const linesFromPoly = polygons.features.map(f => turf.polygonToLine(f as any)); // cast to any for strict types
        const flat: Feature[] = [];
        linesFromPoly.forEach(res => {
            if(res.type === 'FeatureCollection') flat.push(...res.features as Feature[]);
            else flat.push(res as Feature);
        });
        flat.forEach(f => f.properties = { label: 'Sınır Çizgisi' });
        resultGeoJSON = turf.featureCollection(flat);
        message = "Poligondan Çizgiye: Kapalı alanların sınırları, çizgi (LineString) verisine dönüştürüldü.\n\n❓ Neden Kullanılır?\nSınır analizi için. Örnek: Bir göl poligonundan 'kıyı şeridi' çizgisi elde etmek, bir parselin çevre duvarı uzunluğunu hesaplamak veya sınır çizgisi üzerinde (içini doldurmadan) işlem yapmak için.";
        break;
    }

    case ToolType.LINE_TO_POLYGON: {
        let target = getLineById('SiteFence');
        if (!target) target = lines.features[0] as Feature<LineString>;
        if (target) {
            // Cast to any because turf.lineToPolygon might be strict with input type
            const polys = [turf.lineToPolygon(target as any)];
            if(polys[0]) polys[0].properties = { label: 'Kapalı Alan' };
            resultGeoJSON = turf.featureCollection(polys);
            message = "Çizgiden Poligona: Uçları birleşen çizgi (Çit), kapalı bir alana (Poligon) dönüştürüldü.\n\n❓ Neden Kullanılır?\nVeri tipi dönüşümü için. Örnek: GPS ile arazide yürüyerek kaydedilen bir izi (tracklog) parsel alanına çevirip m² hesabı yapmak veya CAD çizimlerinden gelen çizgileri CBS poligonlarına dönüştürmek için.";
        }
        break;
    }

    case ToolType.SIMPLIFY: {
        const tol = params.tolerance || 0.001; // Default
        
        // Use the new High Resolution Noisy Line
        const highResLine = getLineById('HighResLine');
        
        if (!highResLine) {
            resultGeoJSON = turf.featureCollection([]);
            message = "Örnek veri bulunamadı.";
            break;
        }

        const featuresToProcess = [highResLine as Feature<LineString>];
        const results: Feature[] = [];
        let beforePoints = 0;
        let afterPoints = 0;

        featuresToProcess.forEach(f => {
            // Calculate vertex count before
            const coordsBefore = turf.getCoords(f).flat(Infinity);
            const countBefore = coordsBefore.length / 2;
            beforePoints += countBefore;

            // Clone and style original as 'Ghost' for comparison
            // Cast f to any or Feature<LineString> if clone is strict
            const ghost = turf.clone(f as any);
            ghost.properties = { ...ghost.properties, label: 'Orjinal', stroke: '#475569', fill: 'none', width: 2 };
            results.push(ghost);

            // Simplify
            const simple = turf.simplify(f, { tolerance: tol, highQuality: true, mutate: false });
            
            // Calculate vertex count after
            const coordsAfter = turf.getCoords(simple).flat(Infinity);
            const countAfter = coordsAfter.length / 2;
            afterPoints += countAfter;

            simple.properties = { label: 'Basit', stroke: '#ef4444', fill: 'none', width: 3 };
            results.push(simple);
        });

        resultGeoJSON = turf.featureCollection(results);
        message = `Basitleştirme (Generalizasyon): Çizgi üzerindeki gereksiz detay noktaları temizlendi. (Tolerans: ${tol})\n\n❓ Neden Kullanılır?\nPerformans ve ölçek yönetimi için. Harita uzaklaştıkça (Zoom out) detayların görünmesine gerek yoktur. Web haritalarının hızlı yüklenmesi için veri boyutunu küçültmekte (Data reduction) kullanılır.`;
        stats = { 
            "Önceki Nokta": beforePoints,
            "Sonraki Nokta": afterPoints,
            "Veri Kazancı": `%${((1 - afterPoints/beforePoints)*100).toFixed(1)}`
        };
        break;
    }

    case ToolType.HEXBIN: {
        const cell = params.cellSide || 0.2;
        const bbox = turf.bbox(pointsFC);
        // Expand bbox slightly to catch edge points
        const hexGrid = turf.hexGrid([bbox[0]-0.02, bbox[1]-0.02, bbox[2]+0.02, bbox[3]+0.02], cell, { units: 'kilometers' });
        const collected = turf.collect(hexGrid, pointsFC, 'id', 'pts');
        const valid = collected.features.filter(f => f.properties?.pts && f.properties.pts.length > 0).map(f => {
            const c = f.properties!.pts.length;
            return turf.feature(f.geometry, { ...f.properties, count: c, label: c.toString() });
        });
        resultGeoJSON = turf.featureCollection(valid as Feature[]);
        message = "Hexbin (Altıgen) Yoğunluk Haritası: Noktalar altıgen petekler içinde sayılarak bölgesel yoğunluk görselleştirildi.\n\n❓ Neden Kullanılır?\nBüyük veri görselleştirme için. Binlerce üst üste binen noktayı (örn: taksi duraklamaları, tweet konumları) tek tek göstermek yerine, 'Burada yoğunluk ne kadar?' sorusuna cevap vermek için. Kare gridlere göre göze daha doğal gelir ve komşuluk ilişkileri daha tutarlıdır.";
        break;
    }

    case ToolType.ISOBANDS: {
        const grid = turf.interpolate(pointsFC, 0.05, { gridType: 'point', property: 'revenue', units: 'kilometers' }) as any;
        const breaks = params.breaks || 5;
        const step = 5000 / breaks;
        const breakVals = Array.from({length: breaks}, (_, i) => i * step);
        const iso = turf.isobands(grid, breakVals, { zProperty: 'revenue' });
        iso.features.forEach((f, i) => { 
            f.properties = { ...f.properties, count: i, label: `Seviye ${i+1}` }; 
        });
        resultGeoJSON = iso;
        message = "Isobands (Eş Değer Eğrileri): Noktasal değerler kullanılarak aynı değere sahip alanlar kuşaklar halinde çizildi.\n\n❓ Neden Kullanılır?\nSürekli yüzey haritaları için. Örnek: İzohips (yükseklik) haritaları, İzobar (basınç) haritaları, emlak fiyat bölgeleri veya bir fabrikadan yayılan gürültünün desibel kuşaklarını haritalamak için kullanılır.";
        break;
    }
    
    case ToolType.IDW: {
        const cell = params.cellSize || 0.1;
        const grid = turf.interpolate(pointsFC, cell, { gridType: 'hex', property: 'revenue', units: 'kilometers' });
        
        const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']; // Blue -> Cyan -> Green -> Orange -> Red
        
        grid.features.forEach(f => {
            if (f.properties) {
                const val = f.properties.revenue;
                // Normalize 0-5000 to 0-4 index
                const idx = Math.min(4, Math.floor((val / 5000) * 5));
                const color = colors[idx];
                
                f.properties.fill = color;
                f.properties.stroke = color;
                f.properties.label = Math.floor(val).toString();
            }
        });
        resultGeoJSON = grid;
        message = "IDW Enterpolasyon (Isı Haritası): Sınırlı sayıdaki örnek noktadan (Gelir verisi), tüm şehir için tahmini bir değer yüzeyi oluşturuldu.\n\n❓ Neden Kullanılır?\nBilinmeyen değerleri tahmin etmek için. Örnek: Şehirde sadece 5 tane meteoroloji istasyonu var ama her mahallenin sıcaklığını bilmek istiyoruz. Veya arazideki birkaç sondaj kuyusundan tüm petrol rezervini modellemek için kullanılır.";
        break;
    }

    case ToolType.POINT_GRID:
    case ToolType.SQUARE_GRID:
    case ToolType.TRIANGLE_GRID:
    case ToolType.HEX_GRID: {
        const cell = params.cellSize || 0.5;
        const bbox = turf.bbox(polygons);
        const area = [bbox[0]-0.01, bbox[1]-0.01, bbox[2]+0.01, bbox[3]+0.01] as BBox;
        let grid;
        let typeName = "";
        
        if (tool === ToolType.POINT_GRID) { grid = turf.pointGrid(area, cell); typeName = "Nokta"; }
        else if (tool === ToolType.SQUARE_GRID) { grid = turf.squareGrid(area, cell); typeName = "Kare"; }
        else if (tool === ToolType.TRIANGLE_GRID) { grid = turf.triangleGrid(area, cell); typeName = "Üçgen"; }
        else { grid = turf.hexGrid(area, cell); typeName = "Altıgen"; }
        
        resultGeoJSON = grid;
        message = `${typeName} Grid Üretimi: Çalışma alanı ${cell}km boyutunda düzenli parsellere bölündü.\n\n❓ Neden Kullanılır?\nSistematik çalışma ve indeksleme için. Örnek: Arama-kurtarma ekiplerine sorumluluk bölgesi atamak, tarımsal rekolte analizi için tarlayı eşit parçalara bölmek veya harita paftalama (grid index) sistemi kurmak için.`;
        stats = { "Hücre Sayısı (Count)": grid.features.length };
        break;
    }

    case ToolType.SECTOR: {
        const center = [-74.00, 40.72];
        const radius = params.radius || 1;
        let b1 = params.bearing1 || 0;
        let b2 = params.bearing2 || 90;
        if (b1 === b2) b2 = b1 + 0.1; 
        
        const sector = turf.sector(center, radius, b1, b2, { units: 'kilometers' });
        sector.properties = { label: 'Görüş Açısı' };
        resultGeoJSON = turf.featureCollection([sector, turf.point(center)] as Feature[]);
        message = `Sektör (Sector): Belirli bir açıda ve yarıçapta dairesel dilim oluşturuldu.\n\n❓ Neden Kullanılır?\nGörüş alanı ve kapsama analizleri için. Örnek: Bir güvenlik kamerasının (CCTV) kör noktalarını görmek, bir deniz fenerinin aydınlattığı alanı çizmek veya telekomünikasyon anteninin (sektör anten) sinyal yaydığı alanı modellemek için.`;
        break;
    }

    case ToolType.ELLIPSE: {
        const center = [-74.00, 40.72];
        const xAx = params.xSemiAxis || 1;
        const yAx = params.ySemiAxis || 0.5;
        const ellipse = turf.ellipse(center, xAx, yAx, { units: 'kilometers' });
        ellipse.properties = { label: 'Elips Alan' };
        resultGeoJSON = turf.featureCollection([ellipse, turf.point(center)] as Feature[]);
        message = `Elips (Ellipse): X ve Y eksenlerinde farklı yarıçaplara sahip elips çizildi.\n\n❓ Neden Kullanılır?\nYönlü dağılım analizleri için. Örnek: 'Standart Sapma Elipsi' kullanarak suçların veya bir salgın hastalığın hangi yöne doğru (Kuzey-Güney mi, Doğu-Batı mı?) yayıldığını görmek için kullanılır.`;
        break;
    }

    case ToolType.RANDOM_POINT:
    case ToolType.RANDOM_LINE:
    case ToolType.RANDOM_POLYGON: {
        const count = params.count || 20;
        const bbox = turf.bbox(polygons);
        let rnd;
        if (tool === ToolType.RANDOM_POINT) rnd = turf.randomPoint(count, { bbox });
        else if (tool === ToolType.RANDOM_LINE) rnd = turf.randomLineString(count, { bbox, max_length: 0.01 });
        else rnd = turf.randomPolygon(count, { bbox, max_radial_length: 0.001 }); 
        
        resultGeoJSON = rnd;
        message = `Rastgele Veri Üretimi: Çalışma alanı içinde ${count} adet rastgele özellik oluşturuldu.\n\n❓ Neden Kullanılır?\nTest ve simülasyon için. Örnek: Bir algoritmanın performansını test etmek, Monte Carlo simülasyonları çalıştırmak veya görsel tasarım (Mockup) yaparken yer tutucu veri olarak kullanmak için.`;
        break;
    }

    case ToolType.BOOL_POINT_IN_POLY: {
        const city = getPolyById(1);
        const pt = getPointById(900);
        const result = turf.booleanPointInPolygon(pt, city);
        city.properties = { ...city.properties, label: 'Kapsayan' };
        pt.properties = { ...pt.properties, label: 'İçerideki' };
        // Cast to any to avoid strict FeatureCollection generic inference issues (Polygon vs MultiPolygon)
        resultGeoJSON = turf.featureCollection([city, pt] as any);
        message = `Nokta Poligon İçinde mi? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nGeofencing (Coğrafi Çitleme) için. Örnek: 'Araç belirlenen bölgenin dışına çıktı mı?', 'Bu adres hangi hizmet bölgesine düşüyor?', 'Kullanıcı şu an parkın içinde mi?'.`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
    case ToolType.BOOL_CONTAINS: {
        const city = getPolyById(1);
        const park = getPolyById(2);
        const result = turf.booleanContains(city, park);
        city.properties = { ...city.properties, label: 'Kapsayan' };
        park.properties = { ...park.properties, label: 'İçerilen' };
        resultGeoJSON = turf.featureCollection([city, park] as Feature[]);
        message = `Kapsıyor mu (Contains)? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nHiyerarşik ilişki kontrolü için. Örnek: 'İlçe sınırı, mahalle sınırını tamamen içine alıyor mu?' (Dışarı taşma hatası var mı?) kontrolü yapmak için.`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
    case ToolType.BOOL_CROSSES: {
        const city = getPolyById(1);
        const river = getLineById('River1');
        const result = turf.booleanCrosses(river, city);
        river.properties = { ...river.properties, label: 'Kesen Hat' };
        resultGeoJSON = turf.featureCollection([city, river] as Feature[]);
        message = `Kesiyor mu (Crosses)? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nKesişim tespiti için. Örnek: 'Fay hattı yerleşim yerinin altından geçiyor mu?', 'Nehir otoyolu kesiyor mu (Köprü gerekir mi)?' analizleri için.`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
    case ToolType.BOOL_DISJOINT: {
        const city = getPolyById(1);
        const island = getPolyById(4);
        const result = turf.booleanDisjoint(city, island);
        island.properties = { ...island.properties, label: 'Ayrık Ada' };
        resultGeoJSON = turf.featureCollection([city, island] as Feature[]);
        message = `Ayrık mı (Disjoint)? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nBağımsızlık kontrolü için. Örnek: 'Kimyasal tesis, yerleşim yerinden yeterince uzak (ayrık) mı?', 'İki parsel arasında boşluk var mı?'.`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
    case ToolType.BOOL_OVERLAP: {
        const city = getPolyById(1);
        const park = getPolyById(2);
        const result = turf.booleanOverlap(city, park);
        park.properties = { ...park.properties, label: 'Örtüşen' };
        resultGeoJSON = turf.featureCollection([city, park] as Feature[]);
        message = `Örtüşüyor mu (Overlap)? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nHata denetimi için. Örnek: Kadastroda parsellerin üst üste binmemesi gerekir. Overlap testi ile hatalı çizilmiş ve birbiri üzerine taşmış tapu alanları bulunur.`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
    case ToolType.BOOL_EQUAL: {
        const city = getPolyById(1);
        const ghost = getPolyById(99);
        const result = turf.booleanEqual(city, ghost);
        ghost.properties = { ...ghost.properties, label: 'Kopya' };
        resultGeoJSON = turf.featureCollection([city, ghost] as Feature[]);
        message = `Eşit mi (Equal)? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nVeri doğrulama için. Örnek: 'Veritabanındaki bu kayıt ile şu kayıt mükerrer (duplicate) mi?', 'Zaman içinde parselin sınırları değişmiş mi yoksa aynı mı kalmış?'.`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
    case ToolType.BOOL_TOUCH: {
        const city = getPolyById(1);
        const ind = getPolyById(3);
        const result = turf.booleanTouches(city, ind);
        ind.properties = { ...ind.properties, label: 'Komşu' };
        resultGeoJSON = turf.featureCollection([city, ind] as Feature[]);
        message = `Temas Ediyor mu (Touches)? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nKomşuluk analizi için. Örnek: 'Parsel A, Parsel B ile sınır komşusu mu?', 'Türkiye'nin sınır komşuları hangileridir?' (İç içe geçmeden sadece sınırdan dokunma durumu).`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
    case ToolType.BOOL_INTERSECTS: {
        const city = getPolyById(1);
        const hwy = getLineById('Hwy1');
        const result = turf.booleanIntersects(hwy, city);
        hwy.properties = { ...hwy.properties, label: 'Kesişen' };
        resultGeoJSON = turf.featureCollection([city, hwy] as Feature[]);
        message = `Kesişiyor mu (Intersects)? -> ${result ? 'EVET (TRUE)' : 'HAYIR (FALSE)'}.\n\n❓ Neden Kullanılır?\nEn genel ilişki sorgusudur. 'Bu iki nesne herhangi bir şekilde birbirine değiyor mu?' sorusuna cevap verir. Kapsama, kesme, örtüşme veya temas etme durumlarının hepsinde TRUE döner. Hızlı filtreleme için kullanılır.`;
        stats = { "Sonuç": result ? "TRUE" : "FALSE" };
        break;
    }
  }

  return { geoJSON: resultGeoJSON, metadata: { message, stats, geoJSON: resultGeoJSON } };
};