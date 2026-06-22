# AI Kakao — Mobile App (React Native + Expo SDK 54)

Aplikasi mobile diagnosis penyakit tanaman kakao berbasis AI untuk operator perkebunan. Dibuat untuk proyek ITSB LP3B bekerja sama dengan Berau Coal.

## Status proyek

UI-first dengan **mock data** — seluruh data (statistik, hasil diagnosis, riwayat, peta) menggunakan data dummy yang konsisten dengan mockup desain. Belum terhubung ke backend/model ML asli. Struktur sudah disiapkan agar mudah diganti ke API sungguhan (lihat bagian "Menghubungkan ke Backend Asli" di bawah).

## Fitur yang sudah diimplementasikan

- **Splash Screen** — custom splash dengan logo ITSB & Berau Coal, animasi progress bar.
- **Dashboard (Beranda)** — statistik harian, aktivitas terbaru, tombol mulai scan, banner status sinkronisasi.
- **Kamera & Scan** — live camera preview (expo-camera), guided framing overlay, organ selector (Batang/Daun/Buah), simulasi proses analisis AI, indikator mode offline.
- **Hasil Diagnosis** — kartu hasil dengan simulasi GradCAM overlay, severity level, rekomendasi tindakan, simpan & bagikan.
- **Riwayat Inspeksi** — search bar, filter chip (Semua/Kritis/Sedang/Hari ini), indikator item belum tersinkron, tombol sync manual.
- **Peta Kebun** — dua mode yang bisa ditukar: **Peta GPS** (react-native-maps, marker lokasi nyata, locate-me) dan **Sketsa 1:100** (grid skala teknik, denah skematik blok kebun).
- **Mode Offline dengan Auto-Sync** — hasil scan saat offline disimpan ke AsyncStorage dan otomatis diunggah kembali begitu koneksi pulih (lihat bagian khusus di bawah).

## Mode Offline dengan Auto-Sync

Diimplementasikan di `store/useSyncQueueStore.ts`, sesuai prinsip yang dijelaskan di paper ("Seluruh citra dan metadata disimpan secara lokal saat jaringan tidak tersedia. Ketika koneksi pulih, data secara otomatis diunggah dan diproses oleh server").

Cara kerja:
1. `initNetworkListener()` dipasang sekali di `app/_layout.tsx` saat app dibuka, memantau perubahan status koneksi lewat `@react-native-community/netinfo`.
2. Setiap hasil scan baru dari `app/(tabs)/kamera.tsx` diberi flag `synced: false` jika perangkat offline saat itu, lalu dimasukkan ke `enqueue()`.
3. Antrian (`queue`) disimpan ke `AsyncStorage` agar tidak hilang jika app ditutup sebelum sempat sync.
4. Saat NetInfo mendeteksi transisi offline → online, `syncNow()` otomatis dipanggil, mencoba "upload" tiap item (saat ini disimulasikan dengan `mockUploadToServer`, 95% sukses untuk mensimulasikan kegagalan jaringan secara realistis).
5. Item yang gagal upload tetap di antrian untuk percobaan berikutnya.
6. `components/SyncStatusBanner.tsx` menampilkan status (offline / sedang sync / menunggu sync) di Dashboard, Kamera, dan Riwayat.
7. Tombol "Sync sekarang" di layar Riwayat memungkinkan trigger manual jika pengguna tidak ingin menunggu auto-sync.

**Catatan integrasi backend asli**: ganti `mockUploadToServer()` di `useSyncQueueStore.ts` dengan panggilan `fetch()` POST sungguhan ke endpoint server, idealnya dengan upload foto sebagai `multipart/form-data`.

## Peta GPS vs Sketsa 1:100

Layar Peta (`app/(tabs)/peta.tsx`) punya toggle dua mode:

- **Peta GPS** (`components/GpsMapView.native.tsx` / `.web.tsx`) — menggunakan `react-native-maps` dengan koordinat latitude/longitude asli dari setiap inspeksi, mode satelit, tombol "locate me" (`expo-location`), dan marker warna sesuai status. Di platform web, `react-native-maps` tidak memiliki implementasi resmi, sehingga otomatis fallback ke pesan informatif (lihat `GpsMapView.web.tsx`) yang mengarahkan pengguna ke mode Sketsa atau menjalankan di perangkat mobile.
- **Sketsa 1:100** (`components/SketchMapView.tsx`) — denah skematik kebun dengan grid presisi skala 1:100 (SVG), cocok untuk dokumentasi teknis/laporan yang membutuhkan referensi jarak fisik antar blok, terlepas dari ketersediaan GPS.

**Catatan setup**: untuk build Android production, isi `android.config.googleMaps.apiKey` di `app.json` dengan Google Maps API key milik kamu sendiri (dapatkan dari [Google Cloud Console](https://console.cloud.google.com/)). iOS menggunakan Apple Maps secara default tanpa API key tambahan.

## Tech stack

| Kategori | Pilihan | Alasan |
|---|---|---|
| Framework | Expo SDK 54 + React Native 0.81 | Mendukung New Architecture, build cepat |
| Navigasi | Expo Router (file-based) | Konsisten dengan struktur folder `app/` |
| State management | Zustand | Ringan, boilerplate minim, mudah diganti ke React Query saat backend tersedia |
| Kamera | expo-camera | API modern, mendukung SDK 54 |
| Lokasi | expo-location | Untuk fitur geo-tagging dan locate-me di peta |
| Peta GPS | react-native-maps | Marker lokasi nyata, mode satelit |
| Deteksi koneksi | @react-native-community/netinfo | Trigger auto-sync saat online kembali |
| Storage offline | @react-native-async-storage/async-storage | Persist antrian sync antar sesi app |
| Ikon | @expo/vector-icons (Ionicons) | Built-in, tidak perlu font tambahan |
| Peta (grid kustom) | react-native-svg | Render grid skala 1:100 secara presisi (mode Sketsa) |

## Struktur folder

```
ai-kakao-app/
├── app/                      # Routing (Expo Router, file-based)
│   ├── _layout.tsx           # Root layout + splash screen + network listener
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tab navigator
│   │   ├── index.tsx         # Dashboard / Beranda
│   │   ├── kamera.tsx        # Kamera & Scan
│   │   ├── peta.tsx          # Peta Kebun (switcher GPS / Sketsa 1:100)
│   │   └── riwayat.tsx       # Riwayat Inspeksi
│   └── scan/
│       └── result.tsx        # Hasil Diagnosis
├── components/                # Reusable UI components
│   ├── Badge.tsx
│   ├── CustomSplashScreen.tsx
│   ├── FilterChip.tsx
│   ├── GpsMapView.native.tsx   # Peta GPS asli (Android/iOS)
│   ├── GpsMapView.web.tsx      # Fallback untuk web (react-native-maps tidak ada di web)
│   ├── SketchMapView.tsx       # Denah skematik grid skala 1:100
│   ├── InspectionListItem.tsx
│   ├── StatCard.tsx
│   └── SyncStatusBanner.tsx    # Indikator offline / syncing / pending
├── store/                     # Zustand stores
│   ├── useInspectionStore.ts  # State riwayat, filter, statistik
│   ├── useScanStore.ts        # State proses scan/kamera
│   └── useSyncQueueStore.ts   # Antrian sync offline + deteksi koneksi
├── types/
│   └── platform-modules.d.ts  # Shim TS untuk import GpsMapView lintas platform
├── mocks/
│   └── inspections.ts         # Data dummy + tipe data (Inspection, dst.)
├── constants/
│   ├── Colors.ts               # Palet warna (konsisten dgn mockup HTML)
│   └── Theme.ts                 # Spacing, radius, font size
└── assets/images/
    ├── itsb-logo.png
    ├── berau-logo.png
    └── ... (app icon, dsb.)
```

## Cara menjalankan

### 1. Prasyarat
- Node.js 20 LTS atau lebih baru
- npm atau yarn
- Expo Go app di HP (untuk testing cepat), atau Android Studio / Xcode untuk emulator

### 2. Install dependencies
```bash
cd ai-kakao-app
npm install
```

### 3. Jalankan development server
```bash
npx expo start
```
Lalu scan QR code dengan Expo Go (Android/iOS), atau tekan `a` untuk Android emulator, `i` untuk iOS simulator, `w` untuk web.

### 4. Build production (opsional, butuh akun Expo + EAS)
```bash
npx eas build --platform android
npx eas build --platform ios
```

## Catatan teknis penting

- **Izin kamera & lokasi**: aplikasi akan meminta izin saat pertama kali membuka tab Kamera. Jika ditolak, akan muncul layar permintaan izin ulang.
- **expo-camera SDK 54**: menggunakan API `CameraView` (bukan `Camera` lama yang sudah deprecated).
- **New Architecture**: `newArchEnabled: true` di `app.json` — sudah didukung penuh oleh semua dependency di project ini per SDK 54.
- **Grid peta skala 1:100**: dirender dengan SVG `<Pattern>` — 1 kotak kecil = 1 meter, 1 kotak besar (garis lebih tebal) = 5 meter, sesuai standar peta teknik.

## Menghubungkan ke Backend Asli

Saat model ML/backend sudah tersedia, titik integrasi utama ada di:

1. **`app/(tabs)/kamera.tsx`** — fungsi `handleCapture()` saat ini memanggil `generateMockResult()` (simulasi lokal). Ganti dengan:
   ```ts
   const photo = await cameraRef.current?.takePictureAsync();
   const formData = new FormData();
   formData.append("image", { uri: photo.uri, type: "image/jpeg", name: "scan.jpg" });
   const response = await fetch("https://api-anda.com/diagnose", {
     method: "POST",
     body: formData,
   });
   const result = await response.json();
   ```

2. **`mocks/inspections.ts`** — tipe `Inspection` bisa dipakai langsung sebagai kontrak response API; sesuaikan field jika backend punya skema berbeda.

3. **`store/useInspectionStore.ts`** — saat ini inspeksi disimpan di memori (state Zustand). Untuk persistensi nyata, tambahkan:
   - `zustand/middleware` `persist` + AsyncStorage untuk cache offline, atau
   - React Query / SWR untuk sinkronisasi dengan server (sesuai fitur "Mode Offline dengan Auto-Sync" di paper).

4. **`app/(tabs)/peta.tsx`** — saat ini hanya memakai mode **Sketsa 1:100** (`SketchMapView.tsx`, `MARKER_POSITIONS` hardcoded sebagai kalibrasi manual). Mode Peta GPS sudah dilepas sementara (lihat Riwayat Perbaikan poin 3 di bawah) karena menyebabkan crash tanpa Google Maps API key. Untuk mengaktifkan kembali peta GPS nyata:
   - Pasang ulang `react-native-maps`, generate API key dari Google Cloud Console, isi ke `app.json` (`android.config.googleMaps.apiKey`), build ulang, baru kembalikan komponen `GpsMapView`.
   - Atau gunakan fungsi proyeksi lokal yang mengonversi lat/long ke koordinat piksel kanvas kebun tanpa dependency native maps sama sekali.

## Riwayat Perbaikan (Hasil Testing Build Pertama)

Beberapa isu ditemukan saat testing build EAS pertama dan sudah diperbaiki:

1. **App icon & adaptive icon** — sebelumnya placeholder hijau polos, sekarang memakai komposisi logo ITSB + Berau Coal di atas kartu putih, konsisten dengan splash screen (`icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png`).

2. **App crash saat membuka tab Peta** — akar masalah: `provider={PROVIDER_GOOGLE}` di `GpsMapView.native.tsx` membutuhkan Google Maps API key valid di `app.json` (`android.config.googleMaps.apiKey`). Key yang masih placeholder menyebabkan Google Maps SDK Android **crash native** (force-close total, bukan sekadar gagal render) saat `MapView` mount. Diperbaiki dengan dua lapis pengaman:
   - Mode **Sketsa 1:100** dijadikan default saat membuka tab Peta (tidak butuh API key sama sekali, jadi aman dibuka kapan pun).
   - `GpsMapView.native.tsx` sekarang mengecek validitas API key (via `expo-constants`) sebelum mencoba render `MapView`. Kalau key belum valid/masih placeholder, tampilkan pesan informatif alih-alih membiarkan native SDK crash.
   
   **Untuk mengaktifkan Peta GPS sepenuhnya**: isi `android.config.googleMaps.apiKey` di `app.json` dengan API key asli dari [Google Cloud Console](https://console.cloud.google.com/) (aktifkan "Maps SDK for Android"), lalu build ulang.

3. **Timestamp tidak realtime** — sebelumnya data mock memakai tanggal absolut hardcoded (`"2026-06-18T09:43:00"`), sehingga terasa "kedaluwarsa" begitu hari testing berbeda dari tanggal tersebut. Diperbaiki dengan:
   - `utils/time.ts` — `formatRelativeTimestamp()` menghasilkan label seperti "12 menit lalu", "Baru saja", "Kemarin", dihitung dari `Date` asli, bukan string statis.
   - `mocks/inspections.ts` — data seed sekarang memakai offset relatif (`{ minutesAgo: 12 }`, `{ daysAgo: 1, hoursAgo: 5 }`, dst.) yang dikonversi ke timestamp aktual saat app dibuka, bukan tanggal yang dipatok.
   - Semua tempat yang menampilkan waktu (Dashboard, Riwayat, Hasil Diagnosis, popup Peta) menghitung label dari field `date` (ISO string) secara langsung di setiap render, bukan membaca field `timestamp` statis.
   - `utils/useNowTick.ts` — hook yang memicu re-render setiap 30 detik di layar Dashboard & Riwayat, supaya label waktu relatif terus bertambah otomatis selama layar tersebut dibuka (tanpa perlu pull-to-refresh).
   - Hasil scan baru dari kamera maupun filter "Hari ini" sekarang konsisten memakai `new Date()` aktual, bukan tanggal hardcoded.

## Riwayat Perbaikan — Round 2 (Hasil Testing Build Kedua)

1. **Ikon app terlihat jelek** — desain sebelumnya (2 logo partner berdampingan di kartu putih) terlihat ramai dan tidak proporsional, terutama di `adaptive-icon.png` yang ter-crop OS. Diganti total dengan siluet daun kakao tunggal (putih di atas hijau brand `#236E3C`), jauh lebih bersih dan proporsional di semua ukuran (`icon.png`, `adaptive-icon.png`, `favicon.png`).

2. **Logo nongol sebelum custom splash (terasa "splash dobel")** — penyebabnya: `splash-icon.png` (dipakai native splash Expo, muncul sepersekian detik sebelum komponen React sempat mount) sebelumnya berisi komposisi 2 logo partner, sama persis dengan apa yang ditampilkan custom splash kita — sehingga user melihat dua splash screen berurutan yang isinya mirip tapi tidak identik. Diperbaiki dengan mengganti `splash-icon.png` menjadi siluet daun tunggal yang senada dengan elemen brand di awal custom splash, sehingga transisi terasa menyatu sebagai satu splash screen, bukan dua yang terpisah.

3. **Crash di tab Peta — root cause sesungguhnya** — perbaikan round 1 (menjadikan Sketsa sebagai default + cek API key sebelum render `MapView`) **tidak cukup**, karena `import MapView from "react-native-maps"` di level atas file tetap membuat Metro bundle dan me-load modul native tersebut begitu tab Peta dibuka — terlepas dari mode mana yang sedang aktif/dirender. Kalau native module `react-native-maps` gagal inisialisasi di sisi Android (paling mungkin terkait Google Maps API key yang belum valid), crash terjadi di level *module loading*, bukan di level render JSX — sehingga pengecekan defensif di JS sama sekali tidak menyentuh akar masalahnya.

   **Solusi tuntas**: `react-native-maps` dan seluruh komponen `GpsMapView` (`.native.tsx` / `.web.tsx`) **dihapus total** dari project untuk saat ini. Tab Peta sekarang murni memakai `SketchMapView` (grid skala 1:100, SVG, tanpa dependency native apa pun) — sehingga tidak ada jalur kode mana pun yang bisa memicu crash terkait Google Maps. Tombol "Peta GPS (segera hadir)" ditampilkan dalam keadaan nonaktif sebagai indikasi rencana fitur ke depan.

   **Untuk mengaktifkan Peta GPS di masa depan** (lihat juga bagian "Menghubungkan ke Backend Asli" poin 4): pasang ulang `react-native-maps`, dapatkan Google Maps API key yang **benar-benar valid** dan **sudah diaktifkan** ("Maps SDK for Android") di Google Cloud Console, isi ke `app.json`, build ulang, baru uji di perangkat asli sebelum merilis ke pengguna lain.

## Riwayat Perbaikan — Round 3 (Hasil Testing Build Ketiga)

1. **Crash di Peta — akar masalah sesungguhnya, akhirnya ketemu** — perbaikan round 2 (menghapus `react-native-maps` total) ternyata **belum cukup**, karena `SketchMapView.tsx` (satu-satunya mode peta yang tersisa) memakai `react-native-svg` — modul native lain yang juga rawan crash di Android dengan New Architecture (Fabric), terutama saat memakai elemen `<Pattern>`/`<Defs>` untuk grid berulang seperti yang dipakai di sini.

   **Solusi tuntas kali ini**: `SketchMapView` ditulis ulang total memakai murni `View`/`Text` dari React Native — grid digambar dengan border tipis berulang (bukan SVG pattern), titik pohon dan marker dengan `View` lingkaran biasa. **Dependency `react-native-svg` dihapus total dari `package.json`.** Sekarang tidak ada satu pun modul native pihak ketiga yang dipakai di jalur kode layar Peta — hanya komponen inti React Native yang sudah pasti stabil. Hasil visualnya identik (grid skala 1:100, marker warna, popup, legenda), hanya cara render-nya yang berbeda di balik layar.

2. **Foto hasil pemindaian tidak pernah tampil** — ditemukan akar masalahnya: fungsi `handleCapture()` di `kamera.tsx` **tidak pernah benar-benar memanggil `takePictureAsync()`**. Tombol shutter cuma men-trigger simulasi `setTimeout` tanpa mengambil foto sungguhan — itu sebabnya semua hasil analisis (baik di layar Hasil Analisis maupun Riwayat) selalu menampilkan placeholder generik, bukan foto yang sungguh-sungguh diambil pengguna. Diperbaiki dengan:
   - `handleCapture()` sekarang memanggil `cameraRef.current.takePictureAsync()` sungguhan dan menyimpan `photo.uri` ke setiap data `Inspection` baru (field `photoUri`).
   - Layar **Hasil Analisis** menampilkan foto asli (`Image` component) dengan overlay GradCAM tetap muncul di atasnya untuk kasus terdeteksi sakit.
   - Item di **Riwayat Inspeksi** kini menampilkan thumbnail foto asli (bukan cuma dot warna) jika tersedia.
   - Data mock/seed bawaan (8 item awal) tetap tidak punya foto asli (karena memang simulasi data lama) — ditandai otomatis dengan placeholder seperti sebelumnya, sementara hasil scan baru selalu menampilkan foto sungguhan.

3. **Mode offline/online sulit didemonstrasikan** — sistem sync queue (NetInfo + AsyncStorage + auto-sync) sebenarnya sudah berfungsi sejak Round 1, tapi sulit diuji secara langsung karena bergantung pada device benar-benar kehilangan koneksi internet — tidak praktis untuk demo ke dosen/penguji. Ditambahkan **toggle manual "Simulasikan Mode Offline"** di Dashboard (`components/OfflineModeToggle.tsx`) yang memaksa status `isConnected` aplikasi menjadi `false` terlepas dari koneksi device sungguhan. Saat toggle dimatikan kembali, antrian yang menumpuk selama simulasi offline otomatis di-sync — sehingga seluruh alur kerja (offline → simpan lokal → online → auto-sync) bisa didemonstrasikan kapan saja, di mana saja, tanpa mengubah pengaturan jaringan device.

4. **Waktu pengambilan tidak realtime** — diverifikasi ulang: `generateMockResult()` sudah memanggil `new Date()` tepat saat hasil analisis selesai diproses (~1.6 detik setelah tombol shutter ditekan), bukan saat komponen di-mount. Label waktu yang muncul ("Baru saja", lalu berubah jadi "X menit lalu" seiring waktu) sudah mencerminkan waktu sungguhan perangkat saat itu juga.

## Lisensi & Kredit

Proyek akademik — ITSB (Institut Teknologi Sains Bandung), Fakultas Digital, Desain, dan Bisnis, bekerja sama dengan LP3B dan Berau Coal.
