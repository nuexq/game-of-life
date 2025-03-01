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

export default function ConfigMenu() {
	const { gridSize, setGridSize, updateInterval, setUpdateInterval } =
		useStore();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Collapsible
			open={isOpen}
			onOpenChange={setIsOpen}
			className="fixed top-0 right-0 m-5 w-[250px] rounded-3xl bg-card"
		>
			<div className="flex items-center justify-between space-x-4 px-4 py-2">
				<h4 className="text-sm font-semibold">Config Menu</h4>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="sm">
						<ChevronsUpDown className="h-4 w-4 stroke-foreground" />
						<span className="sr-only">Toggle</span>
					</Button>
				</CollapsibleTrigger>
			</div>

			<CollapsibleContent className="space-y-8 p-4 pb-8">
				<ConfigItem>
					<label className="text-sm">
						Grid Size: {gridSize[0]}x{gridSize[1]}
					</label>

					<Slider
						defaultValue={[gridSize[0]]}
						onValueChange={(e) => setGridSize(Number(e[0]))}
						min={16}
						max={window.innerWidth}
						className="w-[60%]"
						step={8}
					/>
				</ConfigItem>

				<ConfigItem>
					<label className="text-sm">
						Update Interval (ms): {updateInterval}
					</label>
					<Slider
						defaultValue={[updateInterval]}
						onValueChange={(newValue) => setUpdateInterval(newValue[0])}
						min={10}
						max={5000}
						className="w-[60%]"
						step={100}
					/>
				</ConfigItem>
			</CollapsibleContent>
		</Collapsible>
	);
}

const ConfigItem = ({
	children,
	label,
}: {
	children: ReactNode;
	label?: string;
}) => {
	return (
		<div className="flex flex-col items-start justify-center gap-2">
			{label && <label className="text-sm">{label}</label>} {children}
		</div>
	);
};
