/**
 * PhotoStorageService — placeholder untuk penyimpanan foto.
 *
 * Saat ini, foto kamera disimpan di lokasi temporary yang dibuat
 * expo-camera (biasanya di cache directory). URI ini valid selama
 * sesi app berjalan dan biasanya tetap ada bahkan setelah restart
 * di sebagian besar device Android.
 *
 * Untuk penyimpanan permanen jangka panjang (foto tidak hilang
 * setelah clear cache), integrasikan dengan expo-file-system
 * saat backend siap.
 *
 * Untuk upload cloud, ganti fungsi uploadPhotoToCloud() dengan
 * implementasi fetch() ke endpoint backend.
 */

/**
 * Kembalikan URI foto apa adanya (URI temporary dari kamera).
 * Ini cukup untuk menampilkan foto di layar Hasil dan Riwayat
 * selama sesi app berjalan.
 */
export async function savePhotoLocally(
  tempUri: string,
  _inspectionId: string
): Promise<string> {
  // Langsung kembalikan URI asli — tidak perlu copy sekarang.
  // Untuk implementasi penyimpanan permanen, gunakan expo-file-system
  // atau react-native-fs saat backend sudah tersedia.
  return tempUri;
}

/**
 * Upload foto ke cloud. Ganti implementasi ini dengan fetch ke
 * endpoint backend saat siap.
 */
export async function uploadPhotoToCloud(
  _localUri: string,
  inspectionId: string
): Promise<string | null> {
  try {
    // Simulasi upload (hapus dan ganti dengan fetch asli saat backend tersedia)
    await new Promise((r) => setTimeout(r, 500));
    return `https://storage.aikakao.app/photos/${inspectionId}.jpg`;
  } catch {
    return null;
  }
}

export async function deletePhotoLocally(_localUri: string): Promise<void> {
  // No-op untuk saat ini
}
