import { create } from "zustand";
import { OrganType } from "@/mocks/inspections";

export type FramingStatus = "good" | "adjust" | "none";

interface ScanState {
  selectedOrgan: OrganType;
  framingStatus: FramingStatus;
  capturedPhotoUri: string | null;
  isAnalyzing: boolean;

  setSelectedOrgan: (organ: OrganType) => void;
  setFramingStatus: (status: FramingStatus) => void;
  setCapturedPhoto: (uri: string | null) => void;
  setIsAnalyzing: (val: boolean) => void;
  resetScan: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  selectedOrgan: "batang",
  framingStatus: "good",
  capturedPhotoUri: null,
  isAnalyzing: false,

  setSelectedOrgan: (organ) => set({ selectedOrgan: organ }),
  setFramingStatus: (status) => set({ framingStatus: status }),
  setCapturedPhoto: (uri) => set({ capturedPhotoUri: uri }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  resetScan: () =>
    set({ capturedPhotoUri: null, isAnalyzing: false, framingStatus: "good" }),
}));
