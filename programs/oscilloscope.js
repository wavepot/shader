export default c => ({
  type: 'TRIANGLE_FAN',
  count: c.sources.audio.size,
  textures: {
    'u_audio': c.sources.audio
  },
  uniforms: {
    'u_resolution': ['3fv', c.resolution],
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
    uniform float u_offset;

    out float v_alpha;

    #define curr_sample gl_VertexID
    #define prev_sample curr_sample-1
    #define curr_L texelFetch(u_audio, ivec3(curr_sample,0,u_offset), 0).r
    #define curr_R texelFetch(u_audio, ivec3(curr_sample,1,u_offset), 0).r
    #define prev_L texelFetch(u_audio, ivec3(prev_sample,0,u_offset), 0).r
    #define prev_R texelFetch(u_audio, ivec3(prev_sample,1,u_offset), 0).r
    #define curr_xy vec2(curr_L, curr_R)
    #define prev_xy vec2(prev_L, prev_R)

    void main () {
      float intensity = distance(prev_xy, curr_xy);

      v_alpha = .015 / intensity;

      vec2 clip_xy = vec2(curr_xy)
        / u_resolution.xy
        * u_resolution.y
        * vec2(-1.0,-1.0)
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

    in float v_alpha;

    out vec4 fragColor;

    void main () {
      fragColor = vec4(.0, .952, .698, v_alpha);
    }
  `
})
