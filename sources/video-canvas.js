import * as GL from '../gl.js'

export default (gl) => {
  const target = gl.TEXTURE_2D

  const texture = GL.createTexture(gl, {
    data: new Uint8Array([255,0,0,255]),
  })

  const noop = () => {}

  const update = (canvas) => {
    GL.putTexture1(gl, {
      texture,
      data: canvas,
      // flipY: true
    })
  }

  return {
    target,
    texture,
    update,
  }
}
