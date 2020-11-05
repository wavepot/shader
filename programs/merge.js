export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'layer_a': c.a.screen,
    'layer_b': c.b.screen,
  }),
  draw: c => ({
    'shift': ['2fv', c.shift ?? [0,0]],
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

    uniform sampler2D layer_a;
    uniform sampler2D layer_b;

    uniform vec2 shift;

    in vec2 v_texCoord;

    out vec4 fragColor;

    void main () {
      vec4 A = texture(layer_a, v_texCoord);
      vec4 B = texture(layer_b, v_texCoord + shift);

      fragColor.a = B.a+A.a - A.a*B.a;
      fragColor.rgb = (A.rgb * A.a * (1. - B.a) + B.rgb * B.a);
    }
  `
})
