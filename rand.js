/*
  adapted from:
    Unity CJ Lib
    https://github.com/TheAllenChou/unity-cj-lib
    (MIT)
*/

export default `
float rand(float s) {
  return fract(sin(mod(s, 6.2831853)) * 43758.5453123);
}
float randf(float s) {
  return rand(floor(s));
}
float rand(vec2 s) {
  float d = dot(s + 0.1234567, vec2(1111112.9819837, 78.237173));
  float m = mod(d, 6.2831853);
  return fract(sin(m) * 43758.5453123);
}
float rand(vec3 s) {
  float d = dot(s + 0.1234567, vec3(11112.9819837, 378.237173, 3971977.9173179));
  float m = mod(d, 6.2831853);
  return fract(sin(m) * 43758.5453123);
}
float rand(float s, float a, float b) {
  return a + (b - a) * rand(s);
}
float randf(float s, float a, float b) {
  return a + (b - a) * randf(s);
}
vec2 rand(vec2 s, vec2 a, vec2 b) {
  return a + (b - a) * rand(s);
}
vec3 rand(vec3 s, vec3 a, vec3 b) {
  return a + (b - a) * rand(s);
}
vec2 rand_uvec(vec2 s) {
  return normalize(vec2(rand(s), rand(s * 1.23456789)) - 0.5);
}
vec3 rand_uvec(vec3 s) {
  return normalize(vec3(rand(s), rand(s * 1.23456789), rand(s * 9876.54321)) - 0.5);
}
vec2 rand_vec(vec2 s) {
  return rand_uvec(s) * rand(s * 9876.54321);
}
vec3 rand_vec(vec3 s) {
  return rand_uvec(s) * rand(s * 1357975.31313);
}
`
