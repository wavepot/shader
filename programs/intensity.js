export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.screen,
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

    in vec2 v_texCoord;

    out vec4 fragColor;

    // Robin Green, Dec 2016
    // Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
      vec2 uv = fragCoord.xy / iResolution.xy;

        // calculate the intensity bucket for this pixel based on column height (padded at the top)
        const float max_value = 270.0;
        const float buckets = 512.0;
        float bucket_min = log( max_value * floor(uv.y * buckets) / buckets );
        float bucket_max = log( max_value * floor((uv.y * buckets) + 1.0) / buckets );

        // count the count the r,g,b and luma in this column that match the bucket
        vec4 count = vec4(0.0, 0.0, 0.0, 0.0);
        for( int i=0; i < 64; ++i ) {
            float j = float(i) / buckets;
            vec4 pixel = texture(iChannel0, vec2(uv.x, j )) * 256.0;

            // calculate the Rec.709 luma for this pixel
            pixel.a = pixel.r * 0.2126 + pixel.g * 0.7152 + pixel.b * 0.0722;

            vec4 logpixel = log(pixel);
            if( logpixel.r >= bucket_min && logpixel.r < bucket_max) count.r += 1.0;
            if( logpixel.g >= bucket_min && logpixel.g < bucket_max) count.g += 1.0;
            if( logpixel.b >= bucket_min && logpixel.b < bucket_max) count.b += 1.0;
            if( logpixel.a >= bucket_min && logpixel.a < bucket_max) count.a += 1.0;
        }

        // sum luma into RGB, tweak log intensity for readability
        const float gain = 0.3;
        const float blend = 0.6;
        count.rgb = log( mix(count.rgb, count.aaa, blend) ) * gain;

        // output
        fragColor = count;

    }

    void main () {
      vec2 fragCoord = v_texCoord * iResolution.xy;
      mainImage(fragColor, fragCoord);
    }
  `
})
