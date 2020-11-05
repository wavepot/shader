export default {
vertex: `#version 300 es
precision lowp float;

in vec4 a_pos;
in vec2 a_st;

out vec2 v_st;

void main () {
  gl_Position = a_pos;
  v_normal = a_normal;
}

`,

fragment: `#version 300 es
precision lowp float;

in vec2 v_st;

out vec4 fragColor;

void main () {
  fragColor = vec4(.4,0.,0.,1.);
}

`}
