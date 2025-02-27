import WebGPUCanvas from "./components/WebGPUCanvas";

export const GRID_SIZE = 100;
export const UPDATE_INTERVAL = 100;
export const WORKGROUP_SIZE = 8;

export default function App() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-red-500">
      <WebGPUCanvas />
    </div>
  );
}
