import { useEffect, useRef, useState } from "react";
import { render } from "@/gpu/render";
import { initWebGPU } from "@/gpu/core";
import {
  calculateWorkgroupSize,
  createBindGroupLayout,
  createStorageBuffer,
  createUniformBuffer,
} from "@/gpu/utils";
import { createPipeline } from "@/gpu/pipeline";
import { createSimulationPipeline } from "@/gpu/simulation";
import { useWindowSize } from "@uidotdev/usehooks";
import { UPDATE_INTERVAL } from "@/App";

const WebGPUCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const initialized = useRef(false);
  const frameId = useRef<number | null>(null);
  const size = useWindowSize();

  const gridSize = useRef([
    128,
    Math.floor(128 * (window.innerHeight / (window.innerWidth as number))),
  ]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const start = async () => {
      try {
        if (!canvasRef.current) return;

        const { device, context } = await initWebGPU(canvasRef.current);

        const bindGroupLayout = createBindGroupLayout(device);
        const pipelineLayout = device.createPipelineLayout({
          label: "Cell Pipeline Layout",
          bindGroupLayouts: [bindGroupLayout],
        });

        const { maxComputeWorkgroupSizeX, maxComputeWorkgroupSizeY } = device.limits;

        const [workgroupX, workgroupY] = calculateWorkgroupSize(
          gridSize.current[0],
          gridSize.current[1],
          (maxComputeWorkgroupSizeX + maxComputeWorkgroupSizeY) / 2,
        );

        const pipeline = createPipeline(device, pipelineLayout);
        const uniformBuffer = createUniformBuffer(device, gridSize.current);
        const storageBuffer = createStorageBuffer(device, gridSize.current);
        const simulationPipeline = createSimulationPipeline(
          device,
          pipelineLayout,
          workgroupX,
          workgroupY,
        );

        const bindGroups = [
          device.createBindGroup({
            label: "Cell renderer bind group A",
            layout: bindGroupLayout,
            entries: [
              { binding: 0, resource: { buffer: uniformBuffer } },
              { binding: 1, resource: { buffer: storageBuffer[0] } },
              { binding: 2, resource: { buffer: storageBuffer[1] } },
            ],
          }),
          device.createBindGroup({
            label: "Cell renderer bind group B",
            layout: bindGroupLayout,
            entries: [
              { binding: 0, resource: { buffer: uniformBuffer } },
              { binding: 1, resource: { buffer: storageBuffer[1] } },
              { binding: 2, resource: { buffer: storageBuffer[0] } },
            ],
          }),
        ];

        let step = 0;
        let lastUpdate = performance.now();

        const renderLoop = (time: number) => {
          if (time - lastUpdate >= UPDATE_INTERVAL) {
            render(
              device,
              context,
              pipeline,
              simulationPipeline,
              bindGroups,
              step,
              [workgroupX, workgroupY],
              gridSize.current,
            );
            lastUpdate = time;
            step++;
          }
          frameId.current = requestAnimationFrame(renderLoop);
        };

        frameId.current = requestAnimationFrame(renderLoop);
      } catch (err) {
        setError(err as Error);
      }
    };

    start();

    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  return (
    <div className="flex justify-center items-center flex-col">
      {error && <h1 className="text-rose-700">{error.message}</h1>}
      <canvas
        ref={canvasRef}
        width={(size.width as number) - 50}
        height={(size.height as number) - 50}
        className="max-w-full"
      />
    </div>
  );
};

export default WebGPUCanvas;

