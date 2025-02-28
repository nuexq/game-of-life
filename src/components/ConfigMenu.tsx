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
		<div className="fixed top-0 right-0 flex flex-col items-center bg-red-500">
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

			<div className="mt-2">
				<label>
					Update Interval (ms):
					<input
						type="number"
						value={updateInterval}
						onChange={(e) => setUpdateInterval(Number(e.target.value))}
						step={100}
					/>
				</label>
			</div>
		</div>
	);
}
