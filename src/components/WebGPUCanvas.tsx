import React, { useEffect, useRef, useState } from "react";
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
import { useStore } from "@/store/useStore";
import ConfigMenu from "./ConfigMenu";

const WebGPUCanvas: React.FC = () => {
  const { gridSize, setGridSize, updateInterval, setUpdateInterval } =
    useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const frameId = useRef<number | null>(null);
  const size = useWindowSize();

  useEffect(() => {
    let isMounted = true;
    let device: GPUDevice;
    let context: GPUCanvasContext;
    let bindGroups: GPUBindGroup[];
    let pipeline: GPURenderPipeline;
    let simulationPipeline: GPUComputePipeline;
    let uniformBuffer: GPUBuffer;
    let storageBuffer: GPUBuffer[];

    const start = async () => {
      try {
        if (!canvasRef.current || !isMounted) return;

        if (device) {
          storageBuffer?.forEach((buf) => buf.destroy());
          uniformBuffer?.destroy();
          // Don't destroy device here - let garbage collection handle it
        }

        const init = await initWebGPU(canvasRef.current);
        device = init.device;
        context = init.context;

        const bindGroupLayout = createBindGroupLayout(device);
        const pipelineLayout = device.createPipelineLayout({
          label: "Cell Pipeline Layout",
          bindGroupLayouts: [bindGroupLayout],
        });

        const { maxComputeWorkgroupSizeX, maxComputeWorkgroupSizeY } =
          device.limits;

        // Calculate dynamic workgroup sizes
        const [workgroupX, workgroupY] = calculateWorkgroupSize(
          gridSize[0],
          gridSize[1],
          Math.min(maxComputeWorkgroupSizeX, maxComputeWorkgroupSizeY),
        );

        pipeline = createPipeline(device, pipelineLayout);
        uniformBuffer = createUniformBuffer(device, gridSize);
        storageBuffer = createStorageBuffer(device, gridSize);
        simulationPipeline = createSimulationPipeline(
          device,
          pipelineLayout,
          workgroupX,
          workgroupY,
        );

        bindGroups = [
          device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
              { binding: 0, resource: { buffer: uniformBuffer } },
              { binding: 1, resource: { buffer: storageBuffer[0] } },
              { binding: 2, resource: { buffer: storageBuffer[1] } },
            ],
          }),
          device.createBindGroup({
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
          if (!isMounted || !device) return;
          if (time - lastUpdate >= updateInterval) {
            render(
              device,
              context,
              pipeline,
              simulationPipeline,
              bindGroups,
              step,
              [workgroupX, workgroupY],
              gridSize,
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
      isMounted = false;
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
        frameId.current = null;
      }

      // Destroy resources but NOT the device
      storageBuffer?.forEach((buf) => buf.destroy());
      uniformBuffer?.destroy();
    };
  }, [gridSize, updateInterval]); // Effect runs again when these values change

  return (
    <div className="flex justify-center items-center flex-col">
      {error && <h1 className="text-rose-700">{error.message}</h1>}
      <canvas
        ref={canvasRef}
        width={(size.width as number) - 50}
        height={(size.height as number) - 50}
        className="max-w-full"
      />
      <ConfigMenu
        gridSize={gridSize}
        setGridSize={setGridSize}
        updateInterval={updateInterval}
        setUpdateInterval={setUpdateInterval}
      />
    </div>
  );
};

export default WebGPUCanvas;
