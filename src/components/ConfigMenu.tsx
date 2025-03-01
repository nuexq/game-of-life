import { Slider } from "./ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ReactNode, useState } from "react";
import { useStore } from "@/store/useStore";
import { Switch } from "./ui/switch";

export default function ConfigMenu() {
	const {
		gridSize,
		setGridSize,
		updateInterval,
		setUpdateInterval,
		playing,
		setPlaying,
	} = useStore();
	const [isOpen, setIsOpen] = useState(false);

	const handleGridSizeChange = (value: number[]) => {
		setGridSize(Math.max(16, Math.min(value[0], window.innerWidth)));
	};

	const handleUpdateIntervalChange = (value: number[]) => {
		setUpdateInterval(Math.max(10, Math.min(value[0], 5000)));
	};

	const handlePlayingChange = (value: boolean) => {
		setPlaying(value);
	};

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="fixed top-5 right-5 w-[280px] rounded-2xl border border-border bg-card shadow-lg"
		>
			<div className="flex items-center justify-between px-5 py-3">
				<h4 className="text-sm font-semibold text-foreground">Config Menu</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm" aria-label="Toggle Config Menu">
						<ChevronsUpDown className="h-4 w-4 stroke-foreground" />
					</Button>
				</CollapsibleTrigger>
			</div>

			<CollapsibleContent className="space-y-6 border-t border-border p-5">
				<ConfigItem label="Playing" value={playing}>
					<Switch
						checked={playing}
						onCheckedChange={handlePlayingChange}
						aria-label="Playing"
					/>
				</ConfigItem>

				<ConfigItem label="Grid Size" value={`${gridSize[0]}x${gridSize[1]}`}>
					<Slider
						defaultValue={[gridSize[0]]}
						onValueChange={handleGridSizeChange}
						min={16}
						max={window.innerWidth}
						step={8}
						className="w-full"
						aria-label="Grid Size"
					/>
				</ConfigItem>

				<ConfigItem label="Update Interval (ms)" value={updateInterval}>
					<Slider
						defaultValue={[updateInterval]}
						onValueChange={handleUpdateIntervalChange}
						min={10}
						max={5000}
						step={100}
						className="w-full"
						aria-label="Update Interval"
					/>
				</ConfigItem>
			</CollapsibleContent>
		</Collapsible>
	);
}

const ConfigItem = ({
	children,
	label,
	value,
}: {
	children: ReactNode;
	label: string;
	value: number | string | boolean;
}) => {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-xs text-muted-foreground">
				{label}:{" "}
				<span className="font-mono font-semibold text-foreground">{value}</span>
			</p>
			{children}
		</div>
	);
};
