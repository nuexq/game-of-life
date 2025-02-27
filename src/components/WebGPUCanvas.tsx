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
import { GRID_SIZE, UPDATE_INTERVAL } from "@/App";

const WebGPUCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const initialized = useRef(false);
  const frameId = useRef<number | null>(null);

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

        const { maxComputeWorkgroupSizeX, maxComputeWorkgroupSizeY } =
          device.limits;
        const [workgroupX, workgroupY] = calculateWorkgroupSize(
          GRID_SIZE[0],
          GRID_SIZE[1],
          (maxComputeWorkgroupSizeX + maxComputeWorkgroupSizeY) / 2,
        );
        console.log(GRID_SIZE, workgroupX, workgroupY);

        const pipeline = createPipeline(device, pipelineLayout);
        const uniformBuffer = createUniformBuffer(device);
        const storageBuffer = createStorageBuffer(device);
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
              {
                binding: 0,
                resource: { buffer: uniformBuffer },
              },
              {
                binding: 1,
                resource: { buffer: storageBuffer[0] },
              },
              {
                binding: 2,
                resource: { buffer: storageBuffer[1] },
              },
            ],
          }),
          device.createBindGroup({
            label: "Cell renderer bind group B",
            layout: bindGroupLayout,
            entries: [
              {
                binding: 0,
                resource: { buffer: uniformBuffer },
              },
              {
                binding: 1,
                resource: { buffer: storageBuffer[1] },
              },
              {
                binding: 2,
                resource: { buffer: storageBuffer[0] },
              },
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
              step++,
              [workgroupX, workgroupY],
            );
            lastUpdate = time;
          }
          frameId.current = requestAnimationFrame(renderLoop);
        };

        frameId.current = requestAnimationFrame(renderLoop);
      } catch (err) {
        setError(err as Error);
      }
    };

    start();

    // Cleanup resize event listener on component unmount
    return () => {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, []);

  return (
    <div className="flex justify-center items-center flex-col">
      {error && <h1 className="text-rose-700">{error.message}</h1>}
      <canvas ref={canvasRef} width={1200} height={600} className="max-w-full" />
    </div>
  );
};

export default WebGPUCanvas;
