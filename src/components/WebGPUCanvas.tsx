import { useEffect, useRef, useState } from "react";
import { initWebGPU } from "../gpu/webGPUContext";
import { render } from "../gpu/render";
import { createPipeline } from "../gpu/pipeline";
import { createUniformBuffer } from "../gpu/uniformBuffer";
import { createStorageBuffer } from "../gpu/storageBuffer";
import { UPDATE_INTERVAL } from "../App";

const WebGPUCanvas: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [error, setError] = useState<Error | null>(null);
	const [step, setStep] = useState(0);
	const initialized = useRef(false);
	const intervalId = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		const start = async () => {
			try {
				if (!canvasRef.current) return;

				const { device, context } = await initWebGPU(canvasRef.current);

				const pipeline = createPipeline(device);
				const uniformBuffer = createUniformBuffer(device);
				const storageBuffer = createStorageBuffer(device);

				const bindGroups = [
					device.createBindGroup({
						label: "Cell renderer bind group A",
						layout: pipeline.getBindGroupLayout(0),
						entries: [
							{ binding: 0, resource: { buffer: uniformBuffer } },
							{ binding: 1, resource: { buffer: storageBuffer[0] } },
						],
					}),
					device.createBindGroup({
						label: "Cell renderer bind group B",
						layout: pipeline.getBindGroupLayout(0),
						entries: [
							{ binding: 0, resource: { buffer: uniformBuffer } },
							{ binding: 1, resource: { buffer: storageBuffer[1] } },
						],
					}),
				];

				if (intervalId.current) clearInterval(intervalId.current);

				setInterval(() => {
					setStep((prevStep) => {
						const nextStep = prevStep + 1;
						render(device, context, pipeline, bindGroups, nextStep);
						return nextStep;
					});
				}, UPDATE_INTERVAL);
			} catch (err) {
				setError(err as Error);
			}
		};

		start();

		return () => {
			if (intervalId.current) clearInterval(intervalId.current);
		};
	}, []);

	return (
		<div className="flex justify-center items-center flex-col">
			{error && <h1 className="text-rose-700">{error.message}</h1>}
			<canvas ref={canvasRef} width={512} height={512} />
		</div>
	);
};

export default WebGPUCanvas;
