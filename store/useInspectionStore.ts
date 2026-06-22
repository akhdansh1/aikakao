import { create } from "zustand";
import { Inspection, MOCK_INSPECTIONS, OrganType } from "@/mocks/inspections";

export type FilterType = "semua" | "kritis" | "sedang" | "hariIni";

interface InspectionState {
  inspections: Inspection[];
  selectedInspection: Inspection | null;
  filter: FilterType;
  selectedOrgan: OrganType;
  searchQuery: string;
  isOffline: boolean;

  // Actions
  setFilter: (filter: FilterType) => void;
  setSelectedOrgan: (organ: OrganType) => void;
  setSearchQuery: (query: string) => void;
  selectInspection: (inspection: Inspection | null) => void;
  addInspection: (inspection: Inspection) => void;
  toggleOffline: () => void;

  // Derived getters (computed as functions since Zustand doesn't have native selectors)
  getFilteredInspections: () => Inspection[];
  getStats: () => {
    kritis: number;
    sedang: number;
    sehat: number;
    total: number;
  };
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  inspections: MOCK_INSPECTIONS,
  selectedInspection: null,
  filter: "semua",
  selectedOrgan: "batang",
  searchQuery: "",
  isOffline: false,

  setFilter: (filter) => set({ filter }),
  setSelectedOrgan: (organ) => set({ selectedOrgan: organ }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectInspection: (inspection) => set({ selectedInspection: inspection }),
  addInspection: (inspection) =>
    set((state) => ({ inspections: [inspection, ...state.inspections] })),
  toggleOffline: () => set((state) => ({ isOffline: !state.isOffline })),

  getFilteredInspections: () => {
    const { inspections, filter, searchQuery } = get();
    let result = inspections;

    if (filter === "kritis") {
      result = result.filter((i) => i.status === "kritis");
    } else if (filter === "sedang") {
      result = result.filter((i) => i.status === "sedang");
    } else if (filter === "hariIni") {
      const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
      result = result.filter((i) => i.date.startsWith(todayStr));
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.blockId.toLowerCase().includes(q) ||
          (i.disease ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  },

  getStats: () => {
    const { inspections } = get();
    const kritis = inspections.filter((i) => i.status === "kritis").length;
    const sedang = inspections.filter((i) => i.status === "sedang").length;
    const sehat = inspections.filter((i) => i.status === "sehat").length;
    return { kritis, sedang, sehat, total: inspections.length };
  },
}));
