struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) cell: vec2f,
  @location(1) state: f32,
};

@group(0) @binding(0) var<uniform> grid: vec2f;
@group(0) @binding(1) var<storage> cellState: array<u32>;
@group(0) @binding(2) var<storage> _unused: array<u32>; 

@vertex
fn vertexMain(@location(0) position: vec2f,
    @builtin(instance_index) instance: u32) -> VertexOutput {
    let i = f32(instance);
    let cell = vec2f(i % grid.x, floor(i / grid.x));
    let state = f32(cellState[instance]);

    let cellOffset = cell / grid * 2;
    let gridPos = (position * state + 1) / grid - 1 + cellOffset;

    var output: VertexOutput;
    output.position = vec4f(gridPos, 0, 1);
    output.cell = cell;
    output.state = state;
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    return mix(vec4f(0.149, 0.149, 0.149, 1), vec4f(1.0, 0.7, 0.3, 1.0), input.state);
}
