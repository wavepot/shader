export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.screen,
  }),
  draw: c => ({
    'iTime': ['1f', c.time],
  }),
  uniforms: {
    'iResolution': ['3fv', c.resolution]
  },
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

    uniform sampler2D iChannel0;
    uniform vec3 iResolution;
    uniform float iTime;

    in vec2 v_texCoord;

    out vec4 fragColor;

    #define MAX_OFFSET 8.

    float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }

    void main () {
      float iTime = iTime;

      //vec2 uv = fragCoord.xy / iResolution.xy;
      vec2 uv = v_texCoord;
      vec2 texel = 1. / iResolution.xy;

      vec4 img = texture(iChannel0, uv); //texture(iChannel0, uv);

      // you can try and comment / uncomment these three lines
      float step_y = texel.y*(rand(uv.x)*MAX_OFFSET) * (sin(sin(iTime*0.5))*2.0+1.3); // modulate offset
      //float step_y = texel.y*(rand(uv.x)*100.);                   // offset without modulation
      //step_y += rand(uv.x*uv.y*iTime)*0.1*sin(iTime);                // shake offset and modulate it

      if ( dot(img,  vec4(0.299, 0.587, 0.114, 0.) ) > 1.2*(sin(iTime)*0.325+0.50)){
        uv.y+=step_y;
      } else{
        uv.y-=step_y;
      }

      img = texture(iChannel0, uv);
      fragColor = img;
      return;
    }
  `
})
