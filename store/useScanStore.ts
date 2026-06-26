import { create } from "zustand";
import { OrganType } from "@/mocks/inspections";

export type FramingStatus = "good" | "adjust" | "none";

interface ScanState {
  selectedOrgan: OrganType;
  selectedTreeCode: string | null;
  framingStatus: FramingStatus;
  capturedPhotoUri: string | null;
  isAnalyzing: boolean;

  setSelectedOrgan: (organ: OrganType) => void;
  setSelectedTreeCode: (code: string | null) => void;
  setFramingStatus: (status: FramingStatus) => void;
  setCapturedPhoto: (uri: string | null) => void;
  setIsAnalyzing: (val: boolean) => void;
  resetScan: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  selectedOrgan: "batang",
  selectedTreeCode: null,
  framingStatus: "good",
  capturedPhotoUri: null,
  isAnalyzing: false,

  setSelectedOrgan: (organ) => set({ selectedOrgan: organ }),
  setSelectedTreeCode: (code) => set({ selectedTreeCode: code }),
  setFramingStatus: (status) => set({ framingStatus: status }),
  setCapturedPhoto: (uri) => set({ capturedPhotoUri: uri }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  resetScan: () =>
    set({ selectedTreeCode: null, capturedPhotoUri: null, isAnalyzing: false, framingStatus: "good" }),
}));
