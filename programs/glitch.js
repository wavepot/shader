export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.screen,
    'iChannel1': c.sources.noise64,
  }),
  uniforms: {
    'iResolution': ['3fv', c.resolution],
  },
  draw: c => ({
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

    in vec2 v_texCoord;

    out vec4 fragColor;

    float rand(float n){return fract(sin(n) * 43758.5453123);}

    float noise(float p){
      float fl = floor(p);
      float fc = fract(p);
      return mix(rand(fl), rand(fl + 1.0), fc);
    }

    float blockyNoise(vec2 uv, float threshold, float scale, float seed)
    {
      float scroll = floor(iTime + sin(11.0 *  iTime) + sin(iTime) ) * 0.77;
      vec2 noiseUV = uv.yy / scale + scroll;
      float noise2 = texture(iChannel1, noiseUV).r;

      float id = floor( noise2 * 20.0);
      id = noise(id + seed) - 0.5;

      if ( abs(id) > threshold )
        id = 0.0;

      return id;
    }

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
      float rgbIntesnsity = 0.1 + 0.1 * sin(iTime* 3.7);
      float displaceIntesnsity = 0.2 +  0.3 * pow( sin(iTime * 1.2), 5.0);
      float interlaceIntesnsity = 0.01;
      float dropoutIntensity = 0.1;

      vec2 uv = fragCoord/iResolution.xy;

      float displace = blockyNoise(uv + vec2(uv.y, 0.0), displaceIntesnsity, 25.0, 66.6);
      displace *= blockyNoise(uv.yx + vec2(0.0, uv.x), displaceIntesnsity, 111.0, 13.7);

      uv.x += displace ;

      vec2 offs = 0.1 * vec2(blockyNoise(uv.xy + vec2(uv.y, 0.0), rgbIntesnsity, 65.0, 341.0), 0.0);

      float colr = texture(iChannel0, uv-offs).r;
      float colg = texture(iChannel0, uv).g;
      float colb = texture(iChannel0, uv +offs).b;

      float line = fract(fragCoord.y / 3.0);
      vec3 mask = vec3(3.0, 0.0, 0.0);
      if (line > 0.333)
        mask = vec3(0.0, 3.0, 0.0);
      if (line > 0.666)
        mask = vec3(0.0, 0.0, 3.0);

      float maskNoise = blockyNoise(uv, interlaceIntesnsity, 90.0, iTime) * max(displace, offs.x);

      maskNoise = 1.0 - maskNoise;
      if ( maskNoise == 1.0)
          mask = vec3(1.0);

      float dropout = blockyNoise(uv, dropoutIntensity, 11.0, iTime) * blockyNoise(uv.yx, dropoutIntensity, 90.0, iTime);
      mask *= (1.0 - 5.0 * dropout);

      fragColor = vec4(mask * vec3(colr, colg, colb), 1.0);
    }

    void main () {
      vec2 fragCoord = v_texCoord * iResolution.xy;
      mainImage(fragColor, fragCoord);
      fragColor.a = 1.0;
    }
  `
})
