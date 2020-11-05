export default {
vertex: `#version 300 es
precision lowp float;

in vec4 a_pos;
in vec2 a_st;

out vec2 v_st;

void main () {
  gl_Position = a_pos;
  v_st = a_st;
}

`,

fragment: `#version 300 es
precision lowp float;

uniform sampler2D img;
uniform vec3 res;

in vec2 v_st;

out vec4 fragColor;

void main () {
  vec2 st = v_st;
  vec4 col = texture(img, st);
  fragColor = col;
}

`}
