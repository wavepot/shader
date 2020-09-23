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

    precision lowp float;

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

    precision lowp sampler2DArray;
    precision lowp float;

    uniform sampler2DArray u_analyser;
    uniform vec3 u_resolution;
    uniform float u_size;
    uniform float u_offset;
    uniform float u_depth;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      float normal_offset = mod(2.+u_offset, u_depth)/u_depth;

      float y = fract(v_texCoord.y*2.);
      y = y * y;
      // y = pow(u_size, y)/u_size;
      // y -= 1.0/128.;
      float z = mod((v_texCoord.x + normal_offset) * u_depth, u_depth);

      vec4 colL;
      vec4 colR;

      if (v_texCoord.y > .5) {
        float xL = y * u_size;
        float ampL = texelFetch(u_analyser, ivec3(xL, 2., z), 0).r/-100.;
        ampL = sqrt(ampL);
        if (ampL > .01)
          colL = vec4(ampL*7.,ampL*ampL*.6,ampL*ampL*ampL*ampL*7., 1.0-ampL);
      } else {
        float xR = y * u_size;
        float ampR = texelFetch(u_analyser, ivec3(xR, 3., z), 0).r/-100.;
        ampR = sqrt(ampR);
        if (ampR > .01)
          colR = vec4(ampR*7.,ampR*ampR*.6,ampR*ampR*ampR*ampR*7., 1.0-ampR);
      }

      fragColor = colL + colR;
      fragColor.a *= 2.;
    }
  `
})
