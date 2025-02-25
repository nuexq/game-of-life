

export function createVertexBuffer(device) {
	const vertices = new Float32Array([
		//   X,    Y,
		-0.8,
		-0.8, // Triangle 1
		0.8,
		-0.8,
		0.8,
		0.8,

		-0.8,
		-0.8, // Triangle 2
		0.8,
		0.8,
		-0.8,
		0.8,
	]);

	const vertexBuffer = device.createBuffer({
		label: "Cell vertices",
		size: vertices.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
	});

	device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

	return [vertexBuffer, vertices];
}
