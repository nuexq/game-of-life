struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) cell: vec2f,
  @location(1) state: f32,
};

@group(0) @binding(0) var<uniform> grid: vec2f;
@group(0) @binding(1) var<storage> cellState: array<u32>;

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
    let activeColor = vec4f(0.7961, 0.6510, 0.9686, 1.0); // catppuccin mauve
    let inactiveColor = vec4f(0.1176, 0.1176, 0.1804, 1.0); // catppuccin base 

    return mix(inactiveColor, activeColor, input.state);
}
