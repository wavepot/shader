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

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 p = fragCoord.xy/iResolution.xy;

      vec4 col = texture(iChannel0, p);


      // Desaturate
        if(p.x < .25) {
        col = vec4( (col.r+col.g+col.b)/3. );
      }
      // Invert
      else if (p.x < .5) {
        col = vec4(1.) - texture(iChannel0, p);
      }
      // Chromatic aberration
      else if (p.x < .75) {
        vec2 offset = vec2(.01,.0);
        col.r = texture(iChannel0, p + offset.xy).r;
        col.g = texture(iChannel0, p            ).g;
        col.b = texture(iChannel0, p + offset.yx).b;
      }
      // Color switching
      else {
        col.rgb = texture(iChannel0, p).brg;
      }


      //Line
      if( mod(abs(p.x + .5/iResolution.y),.25) < 1./iResolution.y )
        col = vec4(1.);


        fragColor = col;
    }

    void main () {
      vec2 fragCoord = v_texCoord * iResolution.xy;
      mainImage(fragColor, fragCoord);
      fragColor.a = 1.0;
    }
  `
})
