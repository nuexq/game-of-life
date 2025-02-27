import WebGPUCanvas from "./components/WebGPUCanvas";

export const UPDATE_INTERVAL = 100;

export default function App() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-neutral-800">
      <WebGPUCanvas />
    </div>
  );
}
