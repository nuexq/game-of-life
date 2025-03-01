import { Slider } from "./ui/slider";

interface ConfigMenuProps {
	gridSize: number[];
	setGridSize: (x: number) => void;
	updateInterval: number;
	setUpdateInterval: (interval: number) => void;
}

export default function ConfigMenu({
	gridSize,
	setGridSize,
	updateInterval,
	setUpdateInterval,
}: ConfigMenuProps) {
	return (
		<div className="fixed top-0 right-0 flex flex-col items-start gap-5 bg-background rounded-3xl px-10 py-5">
			<label>
				Grid Size:
				<input
					type="number"
					value={gridSize[0]}
					onChange={(e) => setGridSize(Number(e.target.value))}
					min={16}
					step={8}

				/>
			</label>

			<div className="space-y-2">
				<p className="text-xs">Update Interval (ms): {updateInterval}</p>
				<Slider
					defaultValue={[updateInterval]}
					onValueChange={(newValue) => setUpdateInterval(newValue[0])}
					min={10}
					max={5000}
          className="w-[60%]"
					step={100}
				/>
			</div>
		</div>
	);
}
