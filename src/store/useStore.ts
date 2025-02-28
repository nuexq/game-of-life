import { create } from "zustand";

// Define the store
interface Store {
	gridSize: number[];
	setGridSize: (x: number) => void;
	updateInterval: number;
	setUpdateInterval: (interval: number) => void;
}

// Zustand store
export const useStore = create<Store>((set) => ({
	gridSize: [128, Math.floor((128 * window.innerHeight) / window.innerWidth)],
	setGridSize: (x) =>
		set(() => {
			const aspectRatio = window.innerHeight / window.innerWidth;
			return { gridSize: [x, Math.floor(x * aspectRatio)] };
		}),
	updateInterval: 20, // Default update interval in ms
	setUpdateInterval: (interval) => set({ updateInterval: interval }),
}));
