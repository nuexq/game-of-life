import { InitialPattern } from "@/lib/utils";

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
export function createUniformBuffer(device: GPUDevice, gridSize: number[]) {
  const uniformArray = new Float32Array([gridSize[0], gridSize[1]]);

  const uniformBuffer = createGPUBuffer(
    device,
    uniformArray,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  );
  return uniformBuffer;
}

// Create a Storage Buffer (Double Buffering for Cellular Automata)
export function createStorageBuffer(
  device: GPUDevice,
  gridSize: number[],
  patternType: InitialPattern,
  gliderCount: number,
) {
  const cellStateArray = new Uint32Array(gridSize[0] * gridSize[1]);

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

  switch (patternType) {
    case InitialPattern.Random: {
      for (let i = 0; i < cellStateArray.length; ++i) {
        cellStateArray[i] = Math.random() > 0.8 ? 1 : 0;
      }
      break;
    }
    case InitialPattern.Glider: {
      for (let i = 0; i < gliderCount; i++) {
        const glider = [
          [0, 1],
          [1, 2],
          [2, 0],
          [2, 1],
          [2, 2],
        ];
        const offsetX = Math.floor(Math.random() * (gridSize[0] - 3));
        const offsetY = Math.floor(Math.random() * (gridSize[1] - 3));

        glider.forEach(([x, y]) => {
          const gridX = offsetX + x;
          const gridY = offsetY + y;
          if (gridX < gridSize[0] && gridY < gridSize[1]) {
            cellStateArray[gridY * gridSize[0] + gridX] = 1;
          }
        });
      }
      break;
    }
  }

  // Write the initial state to the buffer
  device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray);

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

// calculate workgroup size
export function calculateWorkgroupSize(
  gridWidth: number,
  gridHeight: number,
  maxWorkgroupSize: number,
) {
  const workgroupX = Math.min(
    gridWidth,
    Math.floor(Math.sqrt(maxWorkgroupSize)),
  );
  let workgroupY = Math.min(
    gridHeight,
    Math.floor(maxWorkgroupSize / workgroupX),
  );

  while (workgroupX * workgroupY > maxWorkgroupSize) {
    workgroupY--;
  }

  return [workgroupX, workgroupY];
}
