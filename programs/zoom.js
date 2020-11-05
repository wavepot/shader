export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_screen': c.sources.screen,
  }),
  draw: c => ({
    'times': ['1f', c.times ?? 4]
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

    precision lowp float;

    uniform sampler2D u_screen;

    uniform float times;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      vec4 col = texture(u_screen, v_texCoord/times);
      fragColor = vec4(col.rgb,1.0);
    }
  `
})
