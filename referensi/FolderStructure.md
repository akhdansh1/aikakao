/
├── app/                        # 📍 EXPO ROUTER: Mengatur alur navigasi layar
│   ├── (auth)/                 # Flow autentikasi operator
│   │   └── login.tsx
│   ├── (tabs)/                 # Bottom Tab Navigation
│   │   ├── dashboard.tsx       # Home/Dashboard statistik harian [cite: 267]
│   │   ├── history.tsx         # Riwayat inspeksi & pencarian [cite: 267]
│   │   └── map.tsx             # Peta geo-tagging lokasi penyakit [cite: 318]
│   ├── camera/
│   │   └── capture.tsx         # Layar akuisisi citra (Batang/Daun/Buah) [cite: 267]
│   ├── diagnosis/
│   │   └── [id].tsx            # Detail hasil diagnosis dengan Grad-CAM overlay [cite: 313]
│   ├── _layout.tsx             # Root layout (Provider, Notification Wrapper)
│   └── +not-found.tsx
│
├── src/                        # 🧠 CORE APP LOGIC: Sentralisasi semua source code
│   │
│   ├── assets/                 # Aset statis
│   │   ├── icons/              # Custom icons SVG
│   │   └── images/             # Placeholder, logo ITSB/Berau Coal
│   │
│   ├── components/             # 🧩 UI COMPONENTS (NativeWind styling)
│   │   ├── ui/                 # Komponen generik (Button, Card, Input, Modal)
│   │   └── domain/             # Komponen spesifik sistem Kakao
│   │       ├── GuidedFraming.tsx  # Overlay kamera (Indikator hijau/kuning) [cite: 310, 311]
│   │       ├── OrganSelector.tsx  # Pemilih jenis organ (Batang/Daun/Buah) [cite: 312]
│   │       └── SeverityBadge.tsx  # Indikator keparahan (Rendah/Sedang/Kritis) [cite: 315]
│   │
│   ├── features/               # 🚀 FEATURE MODULES (Logic inti sesuai PDF)
│   │   ├── image-processing/   
│   │   │   ├── resizer.ts      # Logic resize citra ke 1024x768 [cite: 74]
│   │   │   └── avifEncoder.ts  # Logic kompresi AVIF (quality 60-70) [cite: 75]
│   │   │
│   │   ├── offline-sync/
│   │   │   ├── queueStore.ts   # Logic antrean data saat tidak ada sinyal [cite: 86, 316]
│   │   │   └── backgroundSync.ts # Eksekusi upload otomatis saat koneksi pulih [cite: 317]
│   │   │
│   │   └── authentication/
│   │       └── jwtManager.ts   # Penyimpanan dan validasi token JWT secara aman [cite: 231]
│   │
│   ├── core/                   # ⚙️ CONFIG & INFRASTRUCTURE
│   │   ├── api/
│   │   │   ├── apiClient.ts    # Setup Axios, interceptors, error handling
│   │   │   └── endpoints.ts    # URL endpoint (misal: POST /api/v1/predict) [cite: 84]
│   │   ├── db/
│   │   │   └── schema.ts       # Setup SQLite untuk simpanan lokal (Mode Offline) 
│   │   └── store/              # Zustand state management
│   │       └── useInspectionStore.ts # State global untuk proses inspeksi saat ini
│   │
│   ├── hooks/                  # 🪝 CUSTOM HOOKS
│   │   ├── useNetworkStatus.ts # Memantau transisi sinyal 4G/Offline [cite: 316, 317]
│   │   └── useGeoLocation.ts   # Mengambil koordinat GPS saat foto diambil [cite: 61, 318]
│   │
│   ├── types/                  # 🏷️ TYPESCRIPT DEFINITIONS
│   │   ├── api.d.ts            # Tipe data request/response (JSON Grad-CAM) [cite: 141]
│   │   └── models.d.ts         # Interface struktur data tanaman, organ, diagnosis
│   │
│   └── utils/                  # 🛠️ HELPER FUNCTIONS
│       ├── dateFormatting.ts
│       └── fileSystem.ts       # Manajemen baca/tulis file temporary di memori HP
│
├── .eslintrc.js
├── tailwind.config.js          # Konfigurasi utility NativeWind v4
├── tsconfig.json
└── package.json