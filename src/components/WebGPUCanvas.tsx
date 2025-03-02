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

const WebGPUCanvas: React.FC = () => {
  const { gridSize, updateInterval, playing, patternType, gliderCount } =
    useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const frameId = useRef<number | null>(null);
  const size = useWindowSize();
  const updateIntervalRef = useRef(updateInterval);
  const isPlayingRef = useRef(playing);

  useEffect(() => {
    updateIntervalRef.current = updateInterval;
  }, [updateInterval]);
  useEffect(() => {
    isPlayingRef.current = playing;
  }, [playing]);

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

        storageBuffer?.forEach((buf) => buf.destroy());
        uniformBuffer?.destroy();

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

        const [workgroupX, workgroupY] = calculateWorkgroupSize(
          gridSize[0],
          gridSize[1],
          Math.min(maxComputeWorkgroupSizeX, maxComputeWorkgroupSizeY),
        );

        pipeline = createPipeline(device, pipelineLayout);
        uniformBuffer = createUniformBuffer(device, gridSize);
        storageBuffer = createStorageBuffer(
          device,
          gridSize,
          patternType.type,
          gliderCount,
        );

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

          if (step === 0) {
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
          } else if (
            time - lastUpdate >= updateIntervalRef.current &&
            isPlayingRef.current
          ) {
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

      storageBuffer?.forEach((buf) => buf.destroy());
      uniformBuffer?.destroy();
    };
  }, [gridSize, patternType.key, patternType.type, gliderCount]);

  return (
    <>
      {error ? (
        <div className="flex flex-col justify-center items-center gap-2">
          <h1 className="text-destructive font-semibold text-lg">
            {error.message}
          </h1>
          {error.message === "WebGPU is not supported!" ? (
            <p className="text-sm text-muted-foreground">
              Use a supported browser like google chrome
            </p>
          ) : error.message === "Failed to get GPU adapter!" ? (
            <p className="text-sm text-muted-foreground">
              Try to enable WebGPU and vulkan in your browser settings
              (chrome://flags)
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Something went wrong
            </p>
          )}
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={size.width as number}
          height={size.height as number}
          className="max-w-full"
        />
      )}
    </>
  );
};

export default WebGPUCanvas;
