export default c => ({
  buffers: [c.buffers.quad],
  textures: c => ({
    'iChannel0': c.sources.screen,
    'u_audio': c.sources.audio,
  }),
  uniforms: {
    'iResolution': ['3fv', c.resolution],
  },
  draw: c => ({
    'iTime': ['1f', c.time],
    'u_offset': ['1f', c.sources.audio.offset],
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

    precision lowp sampler2DArray;
    precision lowp float;

    uniform sampler2D iChannel0;
    uniform vec3 iResolution;
    uniform float iTime;

    uniform sampler2DArray u_audio;
    uniform float u_offset;

    #define curr_L texelFetch(u_audio, ivec3(0,0,u_offset), 0).r
    #define curr_R texelFetch(u_audio, ivec3(0,1,u_offset), 0).r
    #define curr_xy vec2(curr_L, curr_R)

    in vec2 v_texCoord;

    out vec4 fragColor;


    // Robin Green, Dec 2016
    // Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

    vec2 mainSound( float time )
    {
        return curr_xy;
    }

    void mainImage( out vec4 fragColor, in vec2 uv )
    {
        // Output to screen
        vec4 flash = 1.0 - fract(vec4(iTime*2.0, iTime * 1.0, iTime * 8.0, 1.0));
        fragColor = vec4(texture(iChannel0, uv + mainSound(iTime) * 0.1).r, texture(iChannel0, uv).g, texture(iChannel0, uv+ mainSound(iTime) - 0.1).b , 1.0)*1.0 + flash * flash * 0.95;
    }

    void main () {
      mainImage(fragColor, v_texCoord);
    }
  `
})
