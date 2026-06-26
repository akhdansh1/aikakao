import * as MediaLibrary from "expo-media-library";
import {
  documentDirectory,
  copyAsync,
  deleteAsync,
} from "expo-file-system/legacy";

/**
 * Simpan foto ke documents directory supaya URI permanen.
 */
export async function savePhotoLocally(
  tempUri: string,
  inspectionId: string
): Promise<string> {
  const permanentUri = `${documentDirectory}photo_${inspectionId}.jpg`;
  await copyAsync({ from: tempUri, to: permanentUri });
  return permanentUri;
}

/**
 * Simpan foto ke gallery HP (Camera Roll).
 */
const ALBUM_NAME = "AI Kakao";

export async function savePhotoToGallery(localUri: string): Promise<boolean> {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") return false;

    // Simpan ke library dulu, dapat asset-nya
    const asset = await MediaLibrary.createAssetAsync(localUri);

    // Cek apakah album "AI Kakao" sudah ada
    let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
    if (album) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    } else {
      // Buat album baru sekaligus isi dengan foto pertama
      await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Upload foto ke cloud (simulasi — ganti dengan fetch asli saat backend tersedia).
 */
export async function uploadPhotoToCloud(
  _localUri: string,
  inspectionId: string
): Promise<string | null> {
  try {
    await new Promise((r) => setTimeout(r, 500));
    return `https://storage.aikakao.app/photos/${inspectionId}.jpg`;
  } catch {
    return null;
  }
}

export async function deletePhotoLocally(localUri: string): Promise<void> {
  try {
    await deleteAsync(localUri, { idempotent: true });
  } catch {}
}