📱 Mobile Tech Stack Blueprint: Aplikasi Inspeksi Lapangan
1. Core Framework & UI

    Framework: React Native (Expo Managed Workflow). Mempercepat integrasi perangkat keras ponsel (kamera, GPS) tanpa perlu setup Android Studio yang rumit di awal proyek.

    Styling: NativeWind (v4). Menggunakan utility classes ala Tailwind CSS langsung di komponen React Native, yang sangat cocok untuk mendesain antarmuka field-first UX dengan indikator warna yang intuitif bagi operator.  

    Navigation: Expo Router. Menggunakan file-based routing untuk navigasi perpindahan layar yang mulus di antara 4 antarmuka utama: Home/Dashboard, Kamera, Hasil Diagnosis, dan Riwayat Inspeksi.  

    Icons: Lucide React Native. Koleksi ikon modern dan bersih untuk elemen antarmuka.

2. Hardware & Sensor Integration

    Camera Module: expo-camera. Digunakan untuk mengimplementasikan Guided Framing System yang memandu operator memposisikan kamera pada jarak dan sudut optimal. Modul ini juga akan dihubungkan dengan fitur pemilihan target organ spesifik seperti batang, daun, atau buah.  

    Location Services: expo-location. Esensial untuk fitur Geo-Tagging, memastikan setiap data inspeksi dan gambar ditandai dengan koordinat GPS yang akurat.  

3. Image Processing & Data Management

    Image Resizer: expo-image-manipulator. Menangani proses pre-processing di sisi klien untuk melakukan resize citra dari resolusi aslinya menjadi 1024×768 piksel.  

    Compression Engine: Custom Native Module / react-native-avif. Diperlukan untuk melakukan encoding gambar ke format AVIF dengan quality factor q=60−70. Ini adalah langkah krusial untuk menghemat bandwidth saat transmisi data via jaringan seluler.  

    Dataset Archiver: react-native-zip-archive. Digunakan untuk membungkus koleksi dataset pohon (gabungan file gambar dan data GPS) ke dalam format ZIP untuk mempermudah ekspor, validasi lokal, atau penyimpanan massal sebelum diunggah.

4. State Management & Offline Mode

    Global State: Zustand. Sangat ringan dan cepat untuk mengatur state interaksi UI dan antrean upload.

    Local Storage: expo-sqlite & react-native-mmkv. MMKV digunakan untuk penyimpanan token sesi yang butuh akses instan, sedangkan SQLite digunakan untuk menyimpan metadata dan citra secara lokal saat masuk ke Mode Offline karena ketiadaan sinyal. Data akan disinkronisasikan (auto-sync) ke server segera setelah koneksi internet pulih.  

5. Networking & Security

    HTTP Client: Axios. Digunakan untuk mengeksekusi transmisi data menggunakan protokol HTTPS POST (multipart/form-data) menuju API Gateway di server.  

    Authentication: Menggunakan token JWT yang disisipkan pada header setiap eksekusi request API untuk memvalidasi identitas operator secara aman.  

    Notifications: expo-notifications. Mengelola push notification agar operator langsung menerima alert hasil diagnosis dan rekomendasi tindakan saat aplikasi berjalan di background.