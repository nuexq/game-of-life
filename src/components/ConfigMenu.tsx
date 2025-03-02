import { Slider } from "./ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Pause, Play } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ReactNode, useState } from "react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

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

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "fixed top-5 right-5 rounded-2xl border border-border bg-card shadow-lg",
        "transition-[width] duration-300 ease-in-out",
        isOpen ? "w-[280px]" : "w-[180px]",
      )}
    >
      <div className="flex items-center justify-between px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Toggle Simulation"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? (
            <Pause className="size-4 stroke-foreground" />
          ) : (
            <Play className="size-4 stroke-foreground" />
          )}
        </Button>

        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" aria-label="Toggle Config Menu">
            <ChevronsUpDown className="size-4 stroke-foreground" />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent open={isOpen}>
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
