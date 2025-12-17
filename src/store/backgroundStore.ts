import { create } from "zustand";

export type BackgroundType = "particles" | "waves";

interface BackgroundState {
  backgroundType: BackgroundType;
  setBackgroundType: (type: BackgroundType) => void;
}

export const useBackgroundStore = create<BackgroundState>((set) => ({
  backgroundType: "particles",
  setBackgroundType: (type) => set({ backgroundType: type }),
}));
