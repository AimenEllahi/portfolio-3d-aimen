import { create } from "zustand";
import { CarColors, CarPart } from "@/components/CarModel";

// Parts we allow users to recolor
export type ConfigurablePart = keyof CarColors;

export const defaultPartColors: CarColors = {
  body: "#1e3a5f",
  accents: "#dc2626",
  wheels: "#18181b",
  interior: "#8B4513",
  windows: "#1a1a2e",
  chrome: "#C0C0C0",
};

interface ConfiguratorState {
  partColors: CarColors;
  selectedPart: ConfigurablePart | null;
  hoveredPart: CarPart | null;
  activePanel: string;
  setPartColor: (part: ConfigurablePart, color: string) => void;
  setSelectedPart: (part: ConfigurablePart | null) => void;
  setHoveredPart: (part: CarPart | null) => void;
  setActivePanel: (panel: string) => void;
  resetColors: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  partColors: defaultPartColors,
  selectedPart: null,
  hoveredPart: null,
  // open parts panel by default to guide the user
  activePanel: "parts",

  setPartColor: (part, color) =>
    set((state) => ({ partColors: { ...state.partColors, [part]: color } })),

  setSelectedPart: (part) => set({ selectedPart: part }),

  setHoveredPart: (part) => set({ hoveredPart: part }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  resetColors: () =>
    set({ partColors: defaultPartColors, selectedPart: null, activePanel: "parts" }),
}));
