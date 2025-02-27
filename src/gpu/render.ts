import { GRID_SIZE, WORKGROUP_SIZE } from "../App";
import { createVertexBuffer } from "./utils";

export function render(
	device: GPUDevice,
	context: GPUCanvasContext,
	pipeline: GPURenderPipeline,
	simulationPipeline: GPUComputePipeline,
	bindGroups: GPUBindGroup[],
	step: number,
) {
	const [vertexBuffer, vertices] = createVertexBuffer(device);

	const encoder = device.createCommandEncoder();

	const computePass = encoder.beginComputePass();

	computePass.setPipeline(simulationPipeline);
	computePass.setBindGroup(0, bindGroups[step % 2]);

	const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);

	computePass.dispatchWorkgroups(workgroupCount, workgroupCount);

	computePass.end();


	const pass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: context.getCurrentTexture().createView(),
				loadOp: "clear",
				clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
				storeOp: "store",
			},
		],
	});

	// Draw the grid.
	pass.setPipeline(pipeline);
	pass.setBindGroup(0, bindGroups[step % 2]); // Now it actually alternates

	pass.setVertexBuffer(0, vertexBuffer);
	pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

	// End the render pass and submit the command buffer
	pass.end();
	device.queue.submit([encoder.finish()]);
}
