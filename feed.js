export default {
vertex: `#version 300 es
precision lowp float;

in vec4 a_pos;
in vec2 a_norm;

out vec2 v_st;

void main () {
  gl_Position = a_pos;
  v_st = a_norm;
}

`,

fragment: `#version 300 es
precision lowp float;

uniform sampler2D img_a;
uniform sampler2D img_b;

in vec2 v_st;

out vec4 fragColor;

void main () {
  vec2 st = v_st;
  vec4 A = texture(img_a, st);
  vec4 B = texture(img_b, st);

  if (dot(A.rgb, A.rgb) < 0.1) {
    fragColor = B;
    return;
  }

  if (dot(B.rgb, B.rgb) < 0.1) {
    fragColor = A;
    return;
  }

  fragColor.a = B.a+A.a - A.a*B.a;
  fragColor.rgb = (A.rgb * A.a * (1. - B.a) + B.rgb * B.a);
}

`}
