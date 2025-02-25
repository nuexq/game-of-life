import { GRID_SIZE } from "../App";
import { createVertexBuffer } from "./buffers";


export function render(device, context, pipeline, bindGroups, step) {
	const [vertexBuffer, vertices] = createVertexBuffer(device);

	const encoder = device.createCommandEncoder();
	const pass = encoder.beginRenderPass({
		colorAttachments: [
			{
				view: context.getCurrentTexture().createView(),
				loadOp: "clear",
				clearValue: { r: 0, g: 0, b: 0.4, a: 1.0 },
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

