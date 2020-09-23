export default c => ({
  buffers: [c.buffers.quad],
  textures: {
    'u_analyser': c.sources.audio
  },
  uniforms: {
    'u_resolution': ['3fv', c.resolution],
    'u_size': ['1f', c.sources.audio.size],
    'u_depth': ['1f', c.sources.audio.depth],
  },
  draw: c => ({
    'u_time': ['1f', c.time],
    'u_offset': ['1f', c.sources.audio.offset],
  }),
  vertex: `
    #version 300 es

    precision highp float;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      gl_Position = a_pos;
      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision highp sampler2DArray;
    precision highp float;

    uniform sampler2DArray u_analyser;
    uniform vec3 u_resolution;
    uniform float u_size;
    uniform float u_offset;
    uniform float u_depth;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      float normal_offset = mod(2.+u_offset,u_depth)/u_depth;

      float total_samples = u_size * u_depth;
      float samples_per_pixel = total_samples/u_resolution.x;

      float x_per_sample = u_resolution.x/total_samples;
      float x_per_size = u_resolution.x/u_depth;

      float normal_x_per_sample = 1.0/total_samples;
      float normal_x_per_depth = 1.0/u_depth;

      float normal_1x = 1.0/u_resolution.x;

      float round_scale = u_resolution.x/4.;
      float x = fract(floor( (v_texCoord.x + normal_offset)*round_scale ) / round_scale) * u_resolution.x * samples_per_pixel;
      float x1 = fract(floor( (v_texCoord.x + normal_offset+normal_1x)*round_scale ) / round_scale) * u_resolution.x * samples_per_pixel;
      float x2 = fract(floor( (v_texCoord.x + normal_offset+normal_1x*2.)*round_scale ) / round_scale) * u_resolution.x * samples_per_pixel;
      float x3 = fract(floor( (v_texCoord.x + normal_offset+normal_1x*3.)*round_scale ) / round_scale) * u_resolution.x * samples_per_pixel;
      float z = x / u_size;
      float z1 = x / u_size;
      float z2 = x / u_size;
      float z3 = x / u_size;
      x = mod(x, u_size);
      x1 = mod(x1, u_size);
      x2 = mod(x2, u_size);
      x3 = mod(x3, u_size);

      float ampL = 0.0;
      float ampL1 = 0.0;
      float ampL2 = 0.0;
      float ampL3 = 0.0;
      float ampR = 0.0;
      float ampR1 = 0.0;
      float ampR2 = 0.0;
      float ampR3 = 0.0;
      ampL = texelFetch(u_analyser, ivec3(x, 0., z), 0).r;
      ampL1 = texelFetch(u_analyser, ivec3(x1, 0., z1), 0).r;
      ampL2 = texelFetch(u_analyser, ivec3(x2, 0., z2), 0).r;
      ampL3 = texelFetch(u_analyser, ivec3(x3, 0., z3), 0).r;
      ampR = texelFetch(u_analyser, ivec3(x, 1., z), 0).r;
      ampR1 = texelFetch(u_analyser, ivec3(x1, 1., z1), 0).r;
      ampR2 = texelFetch(u_analyser, ivec3(x2, 1., z2), 0).r;
      ampR3 = texelFetch(u_analyser, ivec3(x3, 1., z3), 0).r;
      ampL = (ampL1 + ampL2 + ampL3 + ampL) / 4.;
      ampR = (ampR1 + ampR2 + ampR3 + ampR) / 4.;
      if (ampL == 0. && ampR == 0.) discard;

      float aL = 1.0;
      float aR = 1.0;

      float cyL = v_texCoord.y * 2.0 - 1.0 - .1;
      float cyR = v_texCoord.y * 2.0 - 1.0 - .6;

      float fade = 15.;
      float scale = .25;
      float saL = ampL * scale;
      if (abs(cyL) > abs(saL)) aL = 0.0;
      else if (saL < 0. && cyL > 0.) aL = 0.0;
      else if (saL > 0. && cyL < 0.) aL = 0.0;
      else aL = smoothstep(1.0, 0.0, distance(0., cyL*cyL*fade)) * aL;

      float saR = ampR * scale;
      if (abs(cyR) > abs(saR)) aR = 0.0;
      else if (saR < 0. && cyR > 0.) aR = 0.0;
      else if (saR > 0. && cyR < 0.) aR = 0.0;
      else aR = smoothstep(1.0, 0.0, distance(0., cyR*cyR*fade)) * aR;

      fragColor = vec4(0.3,0.8,1.0, aL + aR);
    }
  `
})
