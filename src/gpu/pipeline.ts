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
				format: "float32x2",
				offset: 0,
				shaderLocation: 0, // Position. Matches @location(0) in the @vertex shader.
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
