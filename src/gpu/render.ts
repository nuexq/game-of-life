import { createVertexBuffer } from "./utils";

export function render(
  device: GPUDevice,
  context: GPUCanvasContext,
  pipeline: GPURenderPipeline,
  simulationPipeline: GPUComputePipeline,
  bindGroups: GPUBindGroup[],
  step: number,
  workgroupSize: [number, number],
  gridSize: number[],
) {
  const [vertexBuffer, vertices] = createVertexBuffer(device);

  const encoder = device.createCommandEncoder();

  const computePass = encoder.beginComputePass();

  computePass.setPipeline(simulationPipeline);
  computePass.setBindGroup(0, bindGroups[step % 2]);

  const workgroupCountX = Math.ceil(gridSize[0] / workgroupSize[0]);
  const workgroupCountY = Math.ceil(gridSize[1] / workgroupSize[1]);

  computePass.dispatchWorkgroups(workgroupCountX, workgroupCountY);
  computePass.end();

  const texture = context.getCurrentTexture();
  const textureView = texture.createView();

  if (!texture || !textureView) {
    console.error("Failed to get texture or texture view");
    return;
  }

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0.118, g: 0.118, b: 0.18, a: 1.0 },
        storeOp: "store",
      },
    ],
  });

  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroups[step % 2]); // Now it actually alternates

  pass.setVertexBuffer(0, vertexBuffer);
  pass.draw(vertices.length / 2, gridSize[0] * gridSize[1]);

  pass.end();
  device.queue.submit([encoder.finish()]);
}
