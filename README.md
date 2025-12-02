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

GeoReact CBS Analisti, modern web teknolojileri kullanılarak geliştirilmiş kapsamlı bir coğrafi bilgi sistemleri (CBS/GIS) analiz aracıdır. Bu uygulama, mekansal veri analizi, geometrik hesaplamalar, ağ analizleri ve veri görselleştirme işlemlerini kullanıcı dostu bir arayüz ile sunar.

**English:** GeoReact GIS Analyst is a comprehensive Geographic Information Systems (GIS) analysis tool developed using modern web technologies. This application provides spatial data analysis, geometric calculations, network analysis, and data visualization operations through a user-friendly interface.

### ✨ Temel Özellikler (Key Features)

- 🗺️ **İnteraktif Harita Arayüzü** - OpenLayers tabanlı gelişmiş harita görselleştirme
- 🔧 **50+ Analiz Aracı** - Kapsamlı mekansal analiz araç seti
- 📊 **Gerçek Zamanlı Sonuçlar** - Anında analiz sonuçları ve görselleştirme
- 🎯 **Kullanıcı Dostu Tasarım** - Modern ve sezgisel kullanıcı arayüzü
- 🚀 **Yüksek Performans** - React + TypeScript + Vite teknoloji yığını
- 📱 **Responsive Tasarım** - Tüm cihazlarda uyumlu çalışma

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

### 1. 📐 Geometrik & Ölçüm (Geometry & Measurement)
- **Alan Hesapla** - Poligonların m² veya km² cinsinden alan hesabı
- **Çizgi Uzunluğu** - Yol, boru hattı mesafe ölçümleri
- **Sınırlayıcı Kutu** - Verinin coğrafi sınırlarını belirleme
- **Merkez Noktalar** - Şekillerin ağırlık merkezi hesabı
- **Açı/Azimut** - İki nokta arası pusula yönü hesabı

### 2. 🔄 Vektör İşlemleri (Vector Operations)
- **Tampon Bölge** - Nesne etrafında güvenlik/etki alanı oluşturma
- **Kesişim/Birleşim/Fark** - Geometrik set işlemleri
- **Bütünleştirme** - Aynı tip bölgeleri birleştirme
- **Kırpma** - Veriyi maske ile kesme
- **Basitleştirme** - Geometri karmaşıklığını azaltma

### 3. 🎲 Mekansal Analiz (Spatial Analysis)
- **Mekansal Birleşim** - Nokta-poligon ilişki analizi
- **En Yakın Nokta** - Proximite analizleri
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
├── 📁 components/          # React bileşenleri
│   ├── MapWrapper.tsx      # OpenLayers harita bileşeni
│   └── Sidebar.tsx         # Araç çubuğu bileşeni
├── 📁 services/           # İş mantığı katmanı
│   └── turfService.ts      # Turf.js analiz servisleri
├── 📄 App.tsx             # Ana uygulama bileşeni
├── 📄 constants.ts        # Örnek veriler ve araç tanımları
├── 📄 types.ts            # TypeScript tip tanımları
├── 📄 index.tsx           # Uygulama giriş noktası
├── 📄 index.html          # HTML template
├── 📄 package.json        # Proje bağımlılıkları
├── 📄 tsconfig.json       # TypeScript konfigürasyonu
├── 📄 vite.config.ts      # Vite build konfigürasyonu
└── 📄 README.md          # Proje dokümantasyonu
```

## 🎮 Kullanım (Usage)

### Temel Kullanım Akışı

1. **Araç Seçimi** - Sol panelden analiz yapmak istediğiniz aracı seçin
2. **Parametreler** - Gerekirse analiz parametrelerini ayarlayın
3. **Çalıştırma** - "Çalıştır" butonuna tıklayın
4. **Sonuçlar** - Harita üzerinde sonuçları görün ve sağ alttaki panelden detayları inceleyin

### Örnek Kullanım Senaryoları

- **Emlak Analizi** - Alan hesaplama ve tampon bölge analizi
- **Şehir Planlama** - Yoğunluk haritaları ve erişilebilirlik analizi  
- **Lojistik Optimizasyonu** - En yakın nokta ve mesafe matrisi hesaplama
- **Çevresel Analiz** - Etki alanı modelleme ve risk bölgeleri

## 🔧 Geliştirme (Development)

### Kod Kalitesi
- TypeScript ile tip güvenliği
- ESLint kod standardizasyonu
- Modern React hooks pattern
- Modüler component mimarisi

### Performance Optimizasyonları
- Lazy loading ile kod bölmesi
- Memoization ile re-render optimizasyonu
- Efficient map rendering
- Optimized bundle size

### Genişletilebilirlik
- Plugin mimarisi hazır
- Yeni analiz araçları kolayca eklenebilir
- Flexible data layer desteği
- Custom styling imkanları

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
