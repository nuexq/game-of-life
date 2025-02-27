import { GRID_SIZE } from "../App";

// Create a Generic GPU Buffer (Reusable for Vertex, Index, Uniform Buffers)
export function createGPUBuffer(
  device: GPUDevice,
  data: Float32Array | Uint16Array | Uint32Array,
  usage: GPUBufferUsageFlags,
) {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true,
  });

  new (data instanceof Float32Array ? Float32Array : Uint16Array)(
    buffer.getMappedRange(),
  ).set(data);
  buffer.unmap();
  return buffer;
}

// Create a Vertex Buffer
export function createVertexBuffer(
  device: GPUDevice,
): [GPUBuffer, Float32Array<ArrayBuffer>] {
  const vertices = new Float32Array([
    // X,    Y
    -1,
    -1, // Triangle 1
    1,
    -1,
    1,
    1,

    -1,
    -1, // Triangle 2
    1,
    1,
    -1,
    1,
  ]);

  const vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/ 0, vertices);

  return [vertexBuffer, vertices];
}

// Create a Uniform Buffer
export function createUniformBuffer(device: GPUDevice) {
  const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE]);

  const uniformBuffer = createGPUBuffer(
    device,
    uniformArray,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  );
  return uniformBuffer;
}

// Create a Storage Buffer (Double Buffering for Cellular Automata)
export function createStorageBuffer(device: GPUDevice) {
  const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE);

  // Create two storage buffers (double buffering for state updates)
  const cellStateStorage = [
    device.createBuffer({
      label: "Cell State A",
      size: cellStateArray.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
    device.createBuffer({
      label: "Cell State B",
      size: cellStateArray.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    }),
  ];

  // Initialize cell states randomly
  for (let i = 0; i < cellStateArray.length; ++i) {
    cellStateArray[i] = Math.random() > 0.8 ? 1 : 0;
  }
  device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

  // Initialize an alternating pattern
  for (let i = 0; i < cellStateArray.length; i++) {
    cellStateArray[i] = i % 2;
  }
  device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray);

  return cellStateStorage;
}

// Create bind group layout
export function createBindGroupLayout(device: GPUDevice) {
  return device.createBindGroupLayout({
    label: "Cell Bind Group Layout",
    entries: [
      {
        binding: 0,
        visibility:
          GPUShaderStage.VERTEX |
          GPUShaderStage.FRAGMENT |
          GPUShaderStage.COMPUTE,
        buffer: { type: "uniform" },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage" },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage" },
      },
    ],
  });
}
