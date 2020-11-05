export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_video': c.sources.video,
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      vec4 flip_xy = vec4(1.,-1.,1.,1.);
      vec4 clip_pos = a_pos * flip_xy;

      gl_Position = clip_pos;

      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp sampler2DArray;
    precision lowp float;

    uniform sampler2D u_video;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      fragColor = texture(u_video, v_texCoord);
    }
  `
})
