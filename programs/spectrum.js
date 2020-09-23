// TODO: fix 2nd channel
export default c => ({
  type: 'LINE_STRIP',
  count: c.sources.audio.size,
  textures: {
    'u_audio': c.sources.audio
  },
  uniforms: {
    'u_resolution': ['3fv', c.resolution],
    'u_size': ['1f', c.sources.audio.size],
  },
  draw: c => ({
    'u_time': ['1f', c.time],
    'u_offset': ['1f', c.sources.audio.offset],
  }),
  vertex: `
    #version 300 es

    precision lowp sampler2DArray;
    precision lowp float;

    uniform sampler2DArray u_audio;
    uniform vec3 u_resolution;
    uniform float u_size;
    uniform float u_offset;

    #define curr_sample float(gl_VertexID)
    #define freq texelFetch(u_audio, ivec3(mod(curr_sample, u_size), 2.+curr_sample/u_size, u_offset), 0).r

    void main () {
      float x = float(curr_sample);

      vec2 clip_xy = vec2(x/(u_size*2.), freq/200.)
        * 2.0
        - 1.0
        * vec2(1.0,-1.0)
        - vec2(0.,.8)
        ;

      gl_Position = vec4(clip_xy, 0., 1.);
    }
  `,
  fragment: `
    #version 300 es

    precision lowp sampler2DArray;
    precision lowp float;

    uniform sampler2DArray u_audio;
    uniform vec3 u_resolution;

    out vec4 fragColor;

    void main () {
      fragColor = vec4(1.0, .3, .0, 1.0);
    }
  `
})
