export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.screen,
  }),
  draw: c => ({
    'spacing': ['1f', c.spacing ?? 10],
    'thick': ['1f', c.thick ?? 1],
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
    uniform float spacing;
    uniform float thick;

    in vec2 v_texCoord;

    out vec4 fragColor;

    float to_stripe(in float frag_y) {
        float saw = mod(frag_y, spacing) - .5 * spacing;
        float tri = abs(saw);
        tri = tri - .5 * thick;
        return clamp(1.-tri, 0.0, 1.0);
    }


    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        float y_samp = fragCoord.y - mod(fragCoord.y, spacing);

        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = vec2(fragCoord.x, y_samp)/iResolution.xy;

        float bright = dot(texture(iChannel0, uv).rgb, vec3(.57735));
        bright = clamp(bright, 0.0, 1.0);

        float perturbed_y = fragCoord.y + spacing * bright;

        // Time varying pixel color
        vec3 col = vec3(to_stripe(perturbed_y));

        // Output to screen
        fragColor = vec4(col,1.0);
    }

    void main () {
      vec2 fragCoord = v_texCoord * iResolution.xy;
      mainImage(fragColor, fragCoord);
    }
  `
})
