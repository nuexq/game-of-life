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
	const updateIntervalRef = useRef(updateInterval);

	useEffect(() => {
		updateIntervalRef.current = updateInterval;
	}, [updateInterval]);

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

					if (time - lastUpdate >= updateIntervalRef.current) {
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
	}, [gridSize]);

	return (
		<div className="flex flex-col items-center justify-center">
			{error && <h1 className="text-rose-700">{error.message}</h1>}
			<canvas
				ref={canvasRef}
				width={size.width as number}
				height={size.height as number}
				className="max-w-full"
			/>
		</div>
	);
};

export default WebGPUCanvas;
