export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'u_screen': c.sources.screen,
  }),
  draw: c => ({
    'u_time': ['1f', c.time],
    'zoom': ['1f', c.zoom ?? .1],
    'speed': ['1f', c.speed ?? 1],
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
    uniform float u_time;
    uniform float zoom;
    uniform float speed;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      vec2 fragCoord = v_texCoord-.5;

      float Z = zoom;
      float A = u_time*speed;

      fragCoord += sin(A*0.8);

      Z += sin(A*.2)*100.;

      vec2 xy = mat2(cos(A),-sin(A),sin(A),cos(A))*fragCoord;

      xy.x += cos(.012*Z*xy).y;

      vec4 col = texture(u_screen, mod(xy, 1.0));

      fragColor = col;
      //fragColor.a = 1.0;
    }
  `
})
