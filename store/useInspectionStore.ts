import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Inspection } from "@/mocks/inspections";

const STORAGE_KEY = "@ai-kakao/inspections-v2";

export type FilterType = "semua" | "kritis" | "sedang" | "hariIni";

interface InspectionState {
  inspections: Inspection[];
  selectedInspection: Inspection | null;
  filter: FilterType;
  selectedOrgan: "batang" | "daun" | "buah";
  searchQuery: string;

  hydrateFromStorage: () => Promise<void>;
  setFilter: (f: FilterType) => void;
  setSelectedOrgan: (o: "batang" | "daun" | "buah") => void;
  setSearchQuery: (q: string) => void;
  selectInspection: (i: Inspection | null) => void;
  addInspection: (i: Inspection) => Promise<void>;
  getFilteredInspections: () => Inspection[];
  getStats: () => { kritis: number; sedang: number; sehat: number; total: number };
}

async function persist(list: Inspection[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  inspections: [],
  selectedInspection: null,
  filter: "semua",
  selectedOrgan: "batang",
  searchQuery: "",

  hydrateFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Inspection[] = JSON.parse(raw);
        set({ inspections: parsed });
      }
    } catch {}
  },

  setFilter: (filter) => set({ filter }),
  setSelectedOrgan: (organ) => set({ selectedOrgan: organ }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectInspection: (inspection) => set({ selectedInspection: inspection }),

  addInspection: async (inspection) => {
    const updated = [inspection, ...get().inspections];
    set({ inspections: updated });
    await persist(updated);
  },

  getFilteredInspections: () => {
    const { inspections, filter, searchQuery } = get();
    let result = inspections;
    if (filter === "kritis") result = result.filter((i) => i.status === "kritis");
    else if (filter === "sedang") result = result.filter((i) => i.status === "sedang");
    else if (filter === "hariIni") {
      const today = new Date().toISOString().slice(0, 10);
      result = result.filter((i) => i.date.startsWith(today));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.blockId.toLowerCase().includes(q) || (i.disease ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  },

  getStats: () => {
    const { inspections } = get();
    return {
      kritis: inspections.filter((i) => i.status === "kritis").length,
      sedang: inspections.filter((i) => i.status === "sedang").length,
      sehat: inspections.filter((i) => i.status === "sehat").length,
      total: inspections.length,
    };
  },
}));
