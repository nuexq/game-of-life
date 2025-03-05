import { Slider } from "./ui/slider";
import { Button } from "@/components/ui/button";
import {
	ArrowUpRight,
	ChevronsUpDown,
	Dice5,
	Github,
	Pause,
	Play,
} from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ReactNode, useState } from "react";
import { useStore } from "@/store/useStore";
import { cn, InitialPattern } from "@/lib/utils";
import {
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
	Tooltip,
} from "./ui/tooltip";

export default function ConfigMenu() {
	const {
		gridSize,
		setGridSize,
		updateInterval,
		setUpdateInterval,
		playing,
		setPlaying,
		setPatternType,
		patternType,
		gliderCount,
		setGliderCount,
	} = useStore();

	const [isOpen, setIsOpen] = useState(false);
	const [contentKey, setContentKey] = useState(0);

	const handleGridSizeChange = (value: number[]) => {
		setGridSize(Math.max(16, Math.min(value[0], window.innerWidth)));
	};

	const handleUpdateIntervalChange = (value: number[]) => {
		setUpdateInterval(Math.max(10, Math.min(value[0], 5000)));
	};

	const handleGliderCountChange = (value: number[]) => {
		setGliderCount(value[0]);
	};

	const handlePatternChange = (pattern: InitialPattern) => {
		setPatternType(pattern);
		if (pattern !== patternType.type) {
			setContentKey((prevKey) => prevKey + 1);
		}
	};

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className={cn(
				"fixed top-5 right-5 rounded-2xl border border-border bg-card shadow-lg",
				"transition-[width] duration-300 ease-in-out",
				isOpen ? "w-[280px]" : "w-[220px]",
			)}
		>
			<div className="flex items-center justify-between gap-4 px-5 py-3">
				<div className="flex items-center gap-2">
					<TooltipComponent label={playing ? "Pause" : "Play"}>
						<Button
							variant="ghost"
							size="icon"
							aria-label="Toggle Pause/Play"
							onClick={() => setPlaying(!playing)}
						>
							{playing ? (
								<Pause className="size-4 stroke-foreground" />
							) : (
								<Play className="size-4 stroke-foreground" />
							)}
						</Button>
					</TooltipComponent>
					<TooltipComponent label="Random Pattern">
						<Button
							variant="ghost"
							size="icon"
							aria-label="set to Random Pattern's"
							onClick={() => handlePatternChange(InitialPattern.Random)}
						>
							<Dice5 className="size-4 stroke-foreground" />
						</Button>
					</TooltipComponent>
					<TooltipComponent label="Glider Pattern">
						<Button
							variant="ghost"
							size="icon"
							aria-label="set to Blank"
							onClick={() => handlePatternChange(InitialPattern.Glider)}
						>
							<ArrowUpRight className="size-4 stroke-foreground" />
						</Button>
					</TooltipComponent>
				</div>

				<TooltipComponent label="Toggle Config Menu">
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="icon" aria-label="Toggle Config Menu">
							<ChevronsUpDown className="size-4 stroke-foreground" />
						</Button>
					</CollapsibleTrigger>
				</TooltipComponent>
			</div>

			<CollapsibleContent key={contentKey} open={isOpen}>
				<div className="space-y-2 px-5 py-3 pb-4">
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
					{patternType.type === InitialPattern.Glider ? (
						<ConfigItem label="Glider's Count" value={gliderCount}>
							<Slider
								defaultValue={[gliderCount]}
								onValueChange={handleGliderCountChange}
								min={1}
								max={200}
								step={1}
								className="w-full"
								aria-label="Update Glider's Count"
							/>
						</ConfigItem>
					) : null}
					<div className="flex flex-col gap-2 py-2">
						<Button
							variant="ghost"
							size="icon"
							aria-label="Github Repo"
							asChild
							className="ml-auto"
						>
							<a href="https://github.com/nuexq/game-of-life" target="_blank">
								<Github className="size-4 stroke-foreground" />
							</a>
						</Button>
					</div>
				</div>
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
	value: number | string;
}) => {
	return (
		<div className="flex flex-col gap-2 py-2">
			<p className="text-xs text-muted-foreground">
				{label}:{" "}
				<span className="font-mono font-semibold text-foreground">{value}</span>
			</p>
			{children}
		</div>
	);
};

const TooltipComponent = ({
	children,
	label,
}: { children: ReactNode; label: string }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>{children}</TooltipTrigger>
				<TooltipContent>
					<p>{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
