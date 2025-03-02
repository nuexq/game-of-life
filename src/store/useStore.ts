import { InitialPattern } from "@/lib/utils";
import { create } from "zustand";

// Define the store
interface Store {
  gridSize: number[];
  setGridSize: (x: number) => void;
  updateInterval: number;
  setUpdateInterval: (interval: number) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  patternType: { type: InitialPattern; key: number };
  setPatternType: (patternType: InitialPattern) => void;
}

export const useStore = create<Store>((set) => ({
  gridSize: [128, Math.floor((128 * window.innerHeight) / window.innerWidth)],
  setGridSize: (x) =>
    set(() => {
      const aspectRatio = window.innerHeight / window.innerWidth;
      return { gridSize: [x, Math.floor(x * aspectRatio)] };
    }),
  updateInterval: 20,
  setUpdateInterval: (interval) => set({ updateInterval: interval }),
  playing: false,
  setPlaying: (playing) => set({ playing }),

  patternType: { type: InitialPattern.Random, key: Date.now() },
  setPatternType: (patternType: InitialPattern) =>
    set({ patternType: { type: patternType, key: Date.now() } }),
}));
