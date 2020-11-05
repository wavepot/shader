import rand from './rand.js'
export default {
vertex: `#version 300 es
precision lowp float;

uniform mat4 u_view;
uniform mat4 u_model;
uniform vec3 u_light;
uniform float t;

/* do uniforms */

in vec3 a_pos;
in vec3 a_norm;
in vec2 a_uv;

out vec3 v_light;
out vec3 v_norm;
out vec3 v_pos;
out vec2 v_st;
out vec2 v_uv;

/* includes */
${rand}

/* vertex */

void main () {
  vec3 norm = normalize(mat3(u_model) * a_norm);
  vec3 pos = a_pos;
  vec2 st = a_norm.xy;
  vec3 light = u_light;
  vec2 uv = a_uv;

  /* do code */

  v_norm = norm;
  v_pos = pos;
  v_st = st;
  v_uv = uv;
  v_light = light;

  gl_Position = u_view * u_model * vec4(pos, 1.0);
}

`,

fragment: `#version 300 es
precision lowp float;

uniform sampler2D img;
uniform mat4 u_view;
uniform mat4 u_model;
uniform vec3 u_light;
uniform vec4 u_color;
uniform float t;

/* do uniforms */

in vec3 v_light;
in vec3 v_pos;
in vec3 v_norm;
in vec2 v_st;
in vec2 v_uv;

out vec4 fragColor;

/* includes */
${rand}

/* fragment */

void main () {
  vec3 norm = v_norm;
  vec3 pos = v_pos;
  vec2 st = v_st;
  vec2 uv = v_uv;
  vec3 light = v_light;
  vec4 col = u_color;

  /* do code */

  fragColor = col;
}

`}
