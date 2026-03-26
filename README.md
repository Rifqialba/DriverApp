# Driver App – React Native (Android)

Aplikasi driver sederhana yang memenuhi kriteria skill test fullstack developer. Fitur utama: daftar pekerjaan (trip) dengan dua stop (pickup/dropoff), validasi wajib foto dan GPS di setiap stop, single‑tasking, absensi biometrik, serta UI modern dengan progress bar.

##  Demo Video

[Klik di sini untuk menonton video demo]([https://drive.google.com/file/d/VIDEO_ID/view?usp=sharing](https://drive.google.com/file/d/114cxQY40i1NpnMhS856HwFSVHyc6Mf5Z/view?usp=sharing))  
> *Pastikan Anda menonton dalam resolusi tinggi untuk melihat semua fitur.*

##  Fitur Utama

-  **Manajemen Pekerjaan** – Daftar trip dengan status (tersedia, sedang berjalan, selesai). Hanya satu trip yang bisa dikerjakan dalam satu waktu.
-  **Proses Trip** – Setiap trip terdiri dari 2 stop (Pickup → Dropoff). Driver harus menyelesaikan **foto** dan **konfirmasi GPS** di setiap stop sebelum melanjutkan.
-  **Kamera (simulasi)** – Menggunakan `react-native-vision-camera` (simulasi untuk memudahkan testing).
-  **GPS** – Mengambil lokasi aktual perangkat, membandingkan jarak dengan target stop (validasi radius 100m). Peringatan jika GPS mati.
-  **Biometrik** – Absensi driver menggunakan fingerprint / Face ID. Fallback jika perangkat tidak mendukung.
-  **State Management** – React Context untuk trip dan autentikasi.
-  **UI Modern** – Gradien, kartu dengan bayangan, ikon dari `react-native-vector-icons`, progress bar.

##  Teknologi yang Digunakan

- React Native 0.84.1 (CLI)
- TypeScript
- React Navigation (Stack)
- React Native Vector Icons
- React Native Linear Gradient
- React Native Vision Camera
- React Native Geolocation
- React Native Biometrics
- React Native MMKV (persistensi autentikasi)

##  Menjalankan Aplikasi (Development)

1. Pastikan lingkungan pengembangan React Native siap (Node.js, JDK 17, Android SDK).
2. Clone repository dan install dependensi:
   ```bash
   git clone https://github.com/username/driver-app.git
   cd driver-app
   npm install
   ```
3. Jalankan emulator Android atau hubungkan perangkat fisik.
4. Build dan jalankan:
   ```
   npx react-native run-android
   ```
##  APK (Debug)

   APK siap pakai dapat diunduh di sini:
   [DriverApp.apk](https://drive.google.com/file/d/1faHtogm1_7nfIgSH69uvQT7nF1VqEDPl/view?usp=sharing)

> * Aplikasi di-build dengan konfigurasi debug. Pastikan Anda mengizinkan instalasi dari sumber tidak dikenal.*

##  Catatan Implementasi

- Kamera: Saat ini menggunakan simulasi (Alert). Untuk integrasi kamera asli, uncomment kode di handleTakePhoto dan tambahkan CameraScreen.

- GPS: Validasi jarak menggunakan rumus Haversine. Di emulator, atur lokasi dummy di Extended Controls.

- Biometrik: Di emulator Android, gunakan Extended Controls → Fingerprint untuk menguji.

- NFC (opsional): Tidak diimplementasikan dalam versi ini.

## Lisensi

Dibuat untuk keperluan uji keterampilan.
© 2026-Alba
