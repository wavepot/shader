export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_screen': c.sources.screen,
  }),
  draw: c => ({
    't': ['1f', c.time],
    'speed': ['1f', c.speed],
  }),
  vertex: `
    #version 300 es

    precision lowp float;

    uniform float speed;
    uniform float t;

    in vec4 a_pos;
    in vec2 a_st;

    out vec2 v_texCoord;

    void main () {
      float s = speed * t;
      vec4 pos = vec4(
        a_pos.xy
      * vec2(sin(s), cos(s))
      + vec2(sin(s*.2), cos(s*.2))
      , a_pos.zw);
      gl_Position = pos;
      v_texCoord = a_st;
    }
  `,
  fragment: `
    #version 300 es

    precision lowp float;

    uniform sampler2D u_screen;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      fragColor = texture(u_screen, v_texCoord);
    }
  `
})
