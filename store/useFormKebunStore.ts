import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@ai-kakao/form-kebun";

export interface FormKebun {
  namaOperator: string;
  namaKebun: string;
  blok: string;
  nomorPohon: string;
  organTarget: "batang" | "daun" | "buah";
}

const DEFAULT_FORM: FormKebun = {
  namaOperator: "",
  namaKebun: "",
  blok: "",
  nomorPohon: "",
  organTarget: "batang",
};

interface FormKebunState {
  form: FormKebun;
  isSheetVisible: boolean;
  hydrate: () => Promise<void>;
  updateForm: (data: Partial<FormKebun>) => Promise<void>;
  showSheet: () => void;
  hideSheet: () => void;
}

export const useFormKebunStore = create<FormKebunState>((set, get) => ({
  form: DEFAULT_FORM,
  isSheetVisible: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({ form: JSON.parse(raw) });
    } catch {}
  },

  updateForm: async (data) => {
    const updated = { ...get().form, ...data };
    set({ form: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  },

  showSheet: () => set({ isSheetVisible: true }),
  hideSheet: () => set({ isSheetVisible: false }),
}));