import ConfigMenu from "./components/ConfigMenu";
import WebGPUCanvas from "./components/WebGPUCanvas";

export const UPDATE_INTERVAL = 100;

export default function App() {
	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<ConfigMenu />
			<WebGPUCanvas />
		</div>
	);
}
