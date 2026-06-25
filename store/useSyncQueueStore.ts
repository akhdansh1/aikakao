import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Inspection } from "@/mocks/inspections";

const QUEUE_STORAGE_KEY = "@ai-kakao/sync-queue";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface SyncQueueState {
  isConnected: boolean;
  manualOfflineMode: boolean; // toggle simulasi offline untuk keperluan demo/testing
  queue: Inspection[]; // hasil scan yang belum berhasil di-upload ke server
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  pendingCount: number;

  // Actions
  initNetworkListener: () => () => void; // returns unsubscribe function
  hydrateQueueFromStorage: () => Promise<void>;
  enqueue: (inspection: Inspection) => Promise<void>;
  syncNow: () => Promise<void>;
  clearQueue: () => Promise<void>;
  setManualOfflineMode: (enabled: boolean) => void;
}

/**
 * Simulasi "upload" ke server. Saat backend asli tersedia, ganti
 * fungsi ini dengan fetch() POST ke endpoint sinkronisasi.
 */
async function mockUploadToServer(inspection: Inspection): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 400));
  // Simulasi 95% sukses, supaya ada skenario retry yang realistis.
  return Math.random() > 0.05;
}

async function persistQueue(queue: Inspection[]) {
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn("Gagal menyimpan sync queue ke storage:", err);
  }
}

export const useSyncQueueStore = create<SyncQueueState>((set, get) => ({
  isConnected: true,
  manualOfflineMode: false,
  queue: [],
  syncStatus: "idle",
  lastSyncedAt: null,
  pendingCount: 0,

  initNetworkListener: () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Kalau mode offline manual sedang aktif (demo/testing), abaikan
      // status NetInfo asli — supaya toggle manual selalu jadi sumber
      // kebenaran tunggal sampai pengguna menonaktifkannya sendiri.
      if (get().manualOfflineMode) return;

      const wasOffline = !get().isConnected;
      const isNowOnline = !!state.isConnected;
      set({ isConnected: isNowOnline });

      // Auto-sync begitu koneksi pulih dari offline -> online.
      if (wasOffline && isNowOnline && get().queue.length > 0) {
        get().syncNow();
      }
    });
    return unsubscribe;
  },

  setManualOfflineMode: (enabled) => {
    set({ manualOfflineMode: enabled, isConnected: !enabled });
    // Saat mode offline manual dimatikan (kembali online), langsung
    // coba sync antrian yang sempat menumpuk selama simulasi offline.
    if (!enabled && get().queue.length > 0) {
      get().syncNow();
    }
  },

  hydrateQueueFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed: Inspection[] = JSON.parse(raw);
        set({ queue: parsed, pendingCount: parsed.length });
      }
    } catch (err) {
      console.warn("Gagal membaca sync queue dari storage:", err);
    }
  },

  enqueue: async (inspection) => {
    const updatedQueue = [...get().queue, inspection];
    set({ queue: updatedQueue, pendingCount: updatedQueue.length });
    await persistQueue(updatedQueue);

    // Jika sedang online, langsung coba sync tanpa menunggu trigger lain.
    if (get().isConnected) {
      get().syncNow();
    }
  },

  syncNow: async () => {
    const { queue, isConnected, syncStatus } = get();
    if (!isConnected || queue.length === 0 || syncStatus === "syncing") return;

    set({ syncStatus: "syncing" });

    const remaining: Inspection[] = [];
    for (const item of queue) {
      const success = await mockUploadToServer(item);
      if (!success) {
        remaining.push(item); // gagal, masuk kembali ke antrian untuk dicoba lagi
      }
    }

    await persistQueue(remaining);
    set({
      queue: remaining,
      pendingCount: remaining.length,
      syncStatus: remaining.length === 0 ? "synced" : "error",
      lastSyncedAt: new Date().toISOString(),
    });
  },

  clearQueue: async () => {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    set({ queue: [], pendingCount: 0 });
  },
}));
