export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.noise256,
    'iChannel1': c.sources.screen,
  }),
  uniforms: {
    'iResolution': ['3fv', c.resolution],
  },
  draw: c => ({
    'N': ['1f', c.size ?? 20],
    'iTime': ['1f', c.time],
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

    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform vec3 iResolution;
    uniform float iTime;
    uniform float N;

    in vec2 v_texCoord;

    out vec4 fragColor;

    #define PI 3.1415
    #define TAO 6.283
    #define CLAMP_VAL 0.0

    float remap(float a0, float b0, float a1, float b1, float x) {
      return (b0 - x) / (b0-a0) * (b1-a1) + a1;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord ){
        float i = iTime;
        vec2 mouse = vec2(0., 0.);
        vec2 uv = fragCoord.xy / iResolution.xy;
        uv = 1.0-uv;
        vec2 dividor = vec2(N)/iResolution.xy;

        vec2 p = mod(uv, dividor);

        vec2 tuv = vec2( remap(0.5, 1.5, 0.-mouse.x, 1.+mouse.x, uv.x+0.5),
                         remap(0.5, 1.5, 0.-mouse.x, 1.+mouse.x, uv.y+0.5)
                       );
        mat2 m = mat2(1,sin(uv.x*i),cos(uv.y*i),1.);
        //uv.x += 10.0*sin(iTime*0.0055);
        float scale = 1.; //sin(iTime*.2)*10.;
        vec4 n = texture(iChannel0, uv/scale-p);
        //vec4 n = texture(iChannel0, p);
        //vec4 n = texture(iChannel0, uv-p);
        //vec4 n = texture(iChannel0, uv-p*m);

        vec4 c = texture(iChannel1, tuv);
        c.rgb = sin(cos(mod(c.rgb,n.rgb)*TAO)*TAO);

        fragColor = vec4(c.r,c.r,c.r,1.0);
    }

    void main () {
      vec2 fragCoord = v_texCoord * iResolution.xy;
      mainImage(fragColor, fragCoord);
      fragColor.a = 1.0;
    }
  `
})
