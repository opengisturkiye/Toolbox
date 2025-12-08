# 🌍 GeoReact CBS Analisti (GIS Analyst)

<div align="center">

**Gelişmiş coğrafi bilgi sistemleri analiz aracı - React tabanlı CBS uygulaması**

*Advanced Geographic Information Systems analysis tool - React-based GIS application*

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=flat&logo=typescript)
![OpenLayers](https://img.shields.io/badge/OpenLayers-10.7.0-1F6B75?style=flat)
![Turf.js](https://img.shields.io/badge/Turf.js-7.3.1-green?style=flat)
![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=flat&logo=vite)

</div>

## 🚀 Proje Hakkında (About Project)

GeoReact CBS Analisti, OpenGIS Türkiye atölyeleri için geliştirilen, modern web teknolojileri kullanılarak oluşturulmuş **kapsamlı bir coğrafi bilgi sistemleri (CBS/GIS) analiz aracıdır**. 

Bu uygulama, vektör analiz işlemlerini kod yazmadan **tarayıcı üzerinde interaktif olarak** göstermeyi amaçlamaktadır. Mekansal veri analizi, geometrik hesaplamalar, ağ analizleri ve veri görselleştirme işlemlerini kullanıcı dostu bir arayüz ile sunarak, CBS eğitimlerini daha etkili ve pratik hale getirmektedir.

**🎯 Ana Hedef:** Karmaşık mekansal algoritmaları örnekler üzerinden canlı olarak anlatarak öğrenme sürecini hızlandırmak.

**English:** GeoReact GIS Analyst is a comprehensive Geographic Information Systems (GIS) analysis tool developed for OpenGIS Turkey workshops using modern web technologies. The application aims to demonstrate vector analysis operations **interactively in the browser without coding**. By presenting spatial data analysis, geometric calculations, network analysis, and data visualization through a user-friendly interface, it makes GIS education more effective and practical.

### ✨ Temel Özellikler (Key Features)

- 🗺️ **İnteraktif Harita Arayüzü** - OpenLayers tabanlı gelişmiş harita görselleştirme
- 🔧 **50+ Analiz Aracı** - 7 kategoride kapsamlı mekansal analiz araç seti
- 📊 **Gerçek Zamanlı Sonuçlar** - Anında analiz sonuçları ve harita üzerinde görselleştirme
- 🎯 **Kullanıcı Dostu Tasarım** - Hiç kod yazmadan analiz yapabileceğiniz intuitif arayüz
- 🚀 **Yüksek Performans** - React + TypeScript + Vite teknoloji yığını
- 📱 **Responsive Tasarım** - Tüm cihazlarda uyumlu çalışma
- 🎓 **Eğitim Amaçlı** - Atölyeler ve derslerde vektör analiz öğretimi için ideal

## 🛠️ Teknoloji Yığını (Technology Stack)

### Frontend
- **React 19.2.0** - Kullanıcı arayüzü framework'ü
- **TypeScript 5.8.2** - Tip güvenli JavaScript
- **Vite 6.2.0** - Hızlı build aracı ve geliştirme sunucusu

### Mapping & GIS
- **OpenLayers 10.7.0** - Web tabanlı harita kütüphanesi
- **Turf.js 7.3.1** - Mekansal analiz ve geometrik hesaplamalar
- **GeoJSON 0.5.0** - Coğrafi veri formatı desteği

### UI/UX
- **Lucide React 0.555.0** - Modern ikon kütüphanesi
- **Tailwind CSS** - Utility-first CSS framework

## 📦 Kurulum (Installation)

### Gereksinimler (Prerequisites)
- **Node.js** (18.0+ önerili)
- **npm** veya **yarn** paket yöneticisi
- Modern web tarayıcısı

### Adımlar (Steps)

```bash
# 1. Projeyi klonlayın (Clone the repository)
git clone https://github.com/opengisturkiye/Toolbox.git
cd Toolbox

# 2. Bağımlılıkları yükleyin (Install dependencies)
npm install

# 3. Geliştirme sunucusunu başlatın (Start development server)
npm run dev

# 4. Tarayıcıda açın (Open in browser)
# http://localhost:5173
```

### Production Build

```bash
# Üretim için build alın (Build for production)
npm run build

# Build'i önizleyin (Preview the build)
npm run preview
```

## 🎯 Analiz Araçları (Analysis Tools)

Uygulama, **Turf.js** kütüphanesinden güç alan, **50'den fazla analiz aracı** içermektedir. Bu araçlar 7 ana kategoriye ayrılmıştır:

### 1. 📐 Geometrik & Ölçüm (Geometry & Measurement)
**Mühendislik, emlak ve yer planlaması için temel hesaplamalar**
- **Alan Hesapla (Area)** - Poligonların m² veya km² cinsinden alan hesabı
- **Çizgi Uzunluğu (Length)** - Yol, boru hattı, nehir gibi doğrusal nesnelerin mesafe ölçümleri
- **Sınırlayıcı Kutu (Bounding Box)** - Verinin kapladığı maksimum coğrafi sınırlarını belirleme
- **Merkez Noktalar (Centroids)** - Şekillerin ağırlık merkezini hesaplama (etiket yerleşimi için ideal)
- **Açı/Azimut (Bearing)** - İki nokta arasındaki pusula yönünü derece cinsinden hesaplama

### 2. 🔄 Vektör İşlemleri / Katman Analizi (Vector Operations / Overlay)
**Katmanlar arası karmaşık geometrik işlemler**
- **Tampon Bölge (Buffer)** - Nokta, çizgi veya poligon etrafında dinamik güvenlik/etki alanı oluşturma
- **Kesişim (Intersect)** - İki alanın sadece çakışan (ortak) kısmını çıkarma
- **Birleşim (Union)** - Her iki katmandaki tüm alanları, parçalayarak ve öznitelikleri birleştirerek tek bir katman hâline getirir
- **Fark (Difference)** - Bir alandan diğerini kesip çıkarır (A eksi B operasyonu)
- **Bütünleştir (Dissolve)** - İç sınırları kaldırarak aynı türdeki bölgeleri birleştirme
- **Kırpma (Clip)** - Büyük veriyi belirlenen maske (çerçeve) ile kesme
- **Dış Bükey Örtü (Convex Hull)** - Dağınık noktaları çevreleyen en küçük poligonu çizme
- **Basitleştir (Simplify)** - Karmaşık geometrilerin nokta sayısını azaltarak performansı artırma

### 3. 🎲 Mekansal Analiz / İstatistik (Spatial Analysis)
**Veri dağılımı, uzaklık ve kümeleme analizleri**
- **Mekansal Birleşim (Spatial Join)** - Hangi poligonun içinde kaç nokta olduğunu sayma
- **En Yakın Nokta (Nearest Point)** - Konumunuza en yakın hizmet/ilgi noktasını bulma
- **Voronoi Bölgeleri (Voronoi Diagram)** - Her noktanın hakimiyet alanını haritalama (hizmet alanı planlaması)
- **Üçgen Ağı (TIN)** - Düzensiz noktalardan 3B arazi modeli için yüzey ağı oluşturma
- **K-Means Kümeleme (Clustering)** - Benzer konumdaki noktaları otomatik olarak gruplandırma
- **DBSCAN Kümeleme** - Gürültüyü filtreleyerek yoğunluk kümelerini bulma
- **Mesafe Matrisi (Distance Matrix)** - Tüm noktalar arasındaki mesafeleri matris şeklinde analiz etme

### 4. 🛣️ Ağ Analizi (Network Analysis)
**Yol, altyapı ve bağlantı ağları için analizler**
- **Yol Kesişimleri (Line Intersect)** - Yolların kesiştiği kavşak noktalarını otomatik tespit etme
- **Eğri Yumuşatma (Bezier Spline)** - Keskin köşeli çizgileri estetik eğrilere dönüştürme
- **Parçalara Böl (Line Chunk)** - Uzun hatları belirli km aralıklarla segmentlere ayırma
- **Paralel Ofset (Line Offset)** - Mevcut hattan sabit mesafede paralel yeni şerit oluşturma
- **Çizgiye Yapıştırma (Snap)** - Hatalı GPS noktalarını en yakın yola hizalama

### 5. 📊 Grid & Yoğunluk Analizleri (Grid & Density)
**Alan taraması ve veri yoğunluğu görselleştirmeleri**
- **Altıgen Yoğunluk (Hexbin)** - Veriyi altıgen peteklerde özetleyerek yoğunluğu gösterme
- **Eş Değer Bölgeleri (Isobands)** - Eş yükselti veya sıcaklık eğrileri oluşturma
- **Enterpolasyon (IDW)** - Örnek noktalardan tahmini yüzey haritası üretme (sıcaklık, yağış haritaları)
- **Nokta Grid (Point Grid)** - Sahayı düzenli nokta aralıklarıyla tarama
- **Kare Grid (Square Grid)** - Alanı eşit kare parsellere bölme
- **Üçgen Grid (Triangle Grid)** - Alanı üçgen ağ yapısına bölme
- **Altıgen Grid (Hex Grid)** - Alanı bal peteği (hexagonal) yapısına bölme

### 6. ✅ Topolojik Sorgular (Topological Queries)
**Geometriler arası mekansal ilişkileri belirleme**
- **Nokta İçinde mi? (PointInPoly)** - Konumun yasaklı/izinli bölgede olup olmadığını sorgulama
- **Kapsıyor mu? (Contains)** - Bir alanın diğerini tamamen içine alıp almadığını kontrol etme
- **Kesiyor mu? (Crosses)** - Çizgisel varlıkların kesişim durumunu kontrol etme
- **Ayrık mı? (Disjoint)** - İki nesnenin birbirinden tamamen bağımsız olup olmadığına bakma
- **Örtüşüyor mu? (Overlap)** - İki alanın kısmen üst üste binip binmediğini kontrol etme
- **Eşit mi? (Equal)** - İki geometrinin mekansal olarak birebir aynı olup olmadığına bakma
- **Temas Ediyor mu? (Touch)** - Sadece sınır komşuluğu olup olmadığını kontrol etme
- **Kesişiyor mu? (Intersects)** - Nesneler arasında herhangi bir temas veya çakışma olup olmadığı

### 7. 🎨 Veri Üretimi (Data Generation)
**Test ve simülasyon için veri oluşturma**
- **Sektör (Sector)** - Kamera veya radar görüş açısını temsil eden dilim çizme
- **Elips (Ellipse)** - Yönlü dağılımı göstermek için elips çizme
- **Rastgele Nokta (Random Point)** - Simülasyonlar için rastgele nokta verisi üretme
- **Rastgele Çizgi (Random Line)** - Test amaçlı rastgele çizgi ağları üretme
- **Rastgele Poligon (Random Polygon)** - Test amaçlı rastgele parseller üretme
- **Voronoi Bölgeleri** - Hakimiyet alanı haritalama
- **K-Means/DBSCAN Kümeleme** - Veri segmentasyonu
- **Mesafe Matrisi** - Çok noktalı mesafe hesaplama

### 4. 🛣️ Ağ Analizi (Network Analysis)
- **Yol Kesişimleri** - Kavşak noktası tespiti
- **Eğri Yumuşatma** - Bezier spline transformasyonu
- **Parçalara Bölme** - Hat segmentasyonu
- **Paralel Ofset** - Yan şerit oluşturma
- **GPS Hizalama** - Nokta-çizgi yaklaştırma

### 5. 📊 Grid & Yoğunluk (Grid & Density)
- **Altıgen Yoğunluk** - Hexbin density mapping
- **Enterpolasyon (IDW)** - Yüzey tahmini
- **Grid Sistemleri** - Nokta/Kare/Üçgen/Altıgen gridler
- **Eş Değer Bölgeleri** - Kontur çizgileri

### 6. ✅ Topolojik Sorgular (Topological Queries)
- **Nokta İçinde mi?** - Konum kontrolü
- **Kapsama/Kesişim** - Geometrik ilişki sorguları
- **Temas/Örtüşme** - Sınır ilişki analizleri

### 7. 🎨 Veri Üretimi (Data Generation)
- **Sektör/Elips** - Görüş açısı ve dağılım şekilleri
- **Rastgele Veriler** - Test amaçlı veri üretimi

## 🗂️ Proje Yapısı (Project Structure)

```
georeact-gis-analyst/
├── 📁 components/                 # React bileşenleri
│   ├── MapWrapper.tsx             # OpenLayers harita görselleştirme
│   ├── Sidebar.tsx                # Araç ve kategori seçim paneli
│   ├── Header.tsx                 # Başlık ve veri bilgileri
│   ├── ParameterInputs.tsx        # Dinamik parametre giriş formu
│   └── ResultsPanel.tsx           # Analiz sonuçları gösterim paneli
├── 📁 services/                   # İş mantığı ve API katmanı
│   └── turfService.ts             # Turf.js analiz motorunun entegrasyonu
├── 📁 hooks/                      # Custom React hooks
│   └── useLayerVisibility.ts      # Katman görünürlüğü yönetimi
├── 📄 App.tsx                     # Ana uygulama komponenti
├── 📄 constants.ts                # Örnek veriler, TOOLS_CONFIG ve statik veri
├── 📄 types.ts                    # TypeScript tip ve enum tanımları
├── 📄 index.tsx                   # Uygulama giriş noktası
├── 📄 index.html                  # HTML template
├── 📄 package.json                # Proje bağımlılıkları ve script'leri
├── 📄 tsconfig.json               # TypeScript konfigürasyonu
├── 📄 vite.config.ts              # Vite build ve dev sunucu konfigürasyonu
└── 📄 README.md                   # Proje dokümantasyonu
```

## 🎮 Kullanım (Usage)

### Temel Kullanım Akışı

1. **Araç Seçimi** - Sol panelden (Sidebar) 7 kategoriden istediğiniz analiz aracını seçin
2. **Parametreler** - Araç özelinde gerekirse (buffer mesafesi, grid boyutu, küme sayısı vb.) parametreleri ayarlayın
3. **Çalıştırma** - "Çalıştır (Run)" butonuna tıklatarak analizi başlatın
4. **Sonuçlar** - Harita üzerinde renkli olarak gösterilen sonuçları görün ve sağ alttaki **Sonuç Paneli (Results Panel)** ile detaylı istatistikleri inceleyin

### Örnek Kullanım Senaryoları

#### 📍 Emlak ve Yer Planlaması
- Alan hesaplama ile parsellerin büyüklüğünü öğrenme
- Tampon bölge analizi ile koruma alanları belirleme
- Mekansal birleşim ile civar imkanlarını analiz etme

#### 🏢 Şehir Planlama ve Altyapı
- Hexbin yoğunluk haritaları ile nüfus/işyeri dağılımı görselleştirme
- Voronoi diyagramları ile hizmet alanı planlaması
- Mesh grid oluşturarak kentin farklı bölgelerini karşılaştırma

#### 🚚 Lojistik Optimizasyonu
- En yakın nokta (Nearest) analizi ile operatör atama
- Mesafe matrisi hesaplama ile rota planlaması
- Line offset ile paralel depo yolları tasarlama

#### 🌱 Çevresel Analiz
- Etki alanı modelleme (Buffer) ile kirlilik yayılma alanı
- IDW interpolasyon ile sıcaklık/yağış haritaları
- Isobands ile eş yükselti konturları

#### 📊 Veri Analitikleri
- K-Means ve DBSCAN kümeleme ile veri segmentasyonu
- Convex Hull ile dağınık noktaların sınırlarını bulma
- Simplify analizi ile karmaşık geometrileri düzenleme

## 🔧 Geliştirme (Development)

### Kod Kalitesi
- **TypeScript** ile tam tip güvenliği
- **Modern React Hooks** pattern (useState, useCallback, useMemo)
- **Modüler Component** mimarisi ile bakım kolaylığı
- **Functional Components** ile performans optimizasyonu

### Performance Optimizasyonları
- **useMemo** ile katman görünürlük hesaplamalarının optimize edilmesi
- **useCallback** ile gereksiz re-render'ların önlenmesi
- **OpenLayers** ile efficient harita rendering
- **Turf.js** ile client-side hesaplamaların hızlı yürütülmesi
- Optimized bundle size (gzip sonrası ~200KB)

### Mimarı Özellikleri
- **services/turfService.ts** - Tüm analiz işlemlerinin merkezi yönetimi
- **constants.ts** - 50+ araç tanımının yapılandırılabilir deposu
- **hooks/useLayerVisibility.ts** - Katman görünürlüğü mantığının yeniden kullanılabilir hale getirilmesi
- **types.ts** - Güçlü tip tanımları (ToolType enum, AnalysisResult interface)

### Yeni Araç Ekleme
Yeni bir analiz aracı eklemek oldukça basittir:

1. `types.ts` içinde `ToolType` enum'ine yeni araç ekleyin
2. `constants.ts` içinde `TOOLS_CONFIG` dizisine araç tanımını ekleyin
3. `services/turfService.ts` içinde analiz fonksiyonunu implementeyin
4. Sidebar.tsx içinde gerekirse ikon eşlemesini yapın

Çok katlı mimarı sayesinde frontend ve analiz motoru bağımsız şekilde geliştirilebilir.

## 🚀 Deployment

### Vercel Deployment
```bash
npm run build
# Upload dist/ folder to hosting service
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📚 Eğitim Kaynakları (Educational Resources)

Bu proje şu konuları öğrenmek isteyenler için harika bir kaynaktır:

- **CBS Temeleri** - Vektör analizi, geometrik işlemler, topoloji
- **React Modern Patterns** - Hooks, memoization, component lifecycle
- **TypeScript** - Type-safe application development
- **Web GIS** - OpenLayers, GeoJSON, coordinate systems
- **Spatial Algorithms** - Buffer, Voronoi, clustering, interpolation
- **Interactive Data Visualization** - Real-time map updates, parameter binding

**İdeal Kullanım Alanları:**
- ✅ CBS derslerinde interaktif öğretim aracı
- ✅ Atölyelerde uygulamalı çalışmalar
- ✅ Öğrenci projelerinin temel referansı
- ✅ WebGIS geliştirme eğitimi

## 🤝 Katkıda Bulunma (Contributing)

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/YeniOzellik`)
3. Commit yapın (`git commit -m 'Yeni özellik eklendi'`)
4. Push edin (`git push origin feature/YeniOzellik`)
5. Pull Request açın

## 📄 Lisans (License)

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 İletişim (Contact)

- **GitHub**: [opengisturkiye](https://github.com/opengisturkiye)
- **Email**: opengisturkiye@gmail.com

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

*If you like this project, don't forget to give it a star!*

</div>
