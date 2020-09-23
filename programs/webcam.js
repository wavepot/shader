export default c => ({
  buffers: [c.buffers.quad],
  textures: {
    'u_webcam': c.sources.webcam
  },
  uniforms: {
    'u_resolution': ['3fv', c.resolution],
    'shift': ['2fv', [0,0]]
  },
  vertex: `
    #version 300 es

    precision lowp float;

    uniform vec3 u_resolution;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      vec4 flip_xy = vec4(-1.,-1.,1.,1.);
      vec4 clip_pos = a_pos * flip_xy;

      gl_Position = clip_pos;

      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp sampler2DArray;
    precision lowp float;

    uniform sampler2D u_webcam;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      fragColor = texture(u_webcam, v_texCoord);
    }
  `
})
