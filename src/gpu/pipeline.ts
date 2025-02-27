import pipelineShaderCode from "./shaders/pipeline.wgsl?raw"; //

export function createPipeline(
	device: GPUDevice,
	pipelineLayout: GPUPipelineLayout,
) {
	const cellShaderModule = device.createShaderModule({
		label: "Cell shader",
		code: pipelineShaderCode,
	});

	const vertexBufferLayout = {
		arrayStride: 8,
		attributes: [
			{
				format: "float32x2" as const,
				offset: 0,
				shaderLocation: 0,
			},
		],
	};

	return device.createRenderPipeline({
		label: "Cell pipeline",
		layout: pipelineLayout,
		vertex: {
			module: cellShaderModule,
			entryPoint: "vertexMain",
			buffers: [vertexBufferLayout],
		},
		fragment: {
			module: cellShaderModule,
			entryPoint: "fragmentMain",
			targets: [
				{
					format: navigator.gpu.getPreferredCanvasFormat(),
				},
			],
		},
	});
}
