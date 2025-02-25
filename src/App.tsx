import WebGPUCanvas from "./components/WebGPUCanvas";

export const GRID_SIZE = 32;
export const UPDATE_INTERVAL = 200;

const App = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<WebGPUCanvas />
		</div>
	);
};

export default App;
