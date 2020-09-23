import * as GL from '../gl.js'

export default (gl, { size = 64 }) => {
  const length = size * size

  const random = () => (Math.random() * size | 0)

  const target = gl.TEXTURE_2D

  const numberOfSets = 50
  const randomSets = Array.from({ length: numberOfSets },
    () => Uint8Array.from({ length }, random))

  const pickRandom = () => randomSets[Math.random() * numberOfSets | 0]

  const texture = GL.createTexture(gl, {
    target,
    width: size,
    height: size,
    internal: gl.LUMINANCE,
    format: gl.LUMINANCE,
    wrap_s: gl.REPEAT,
    wrap_t: gl.REPEAT,
    data: pickRandom(),
  })

  const update = () => {
    GL.putSubTexture(gl, {
      target,
      texture,
      width: size,
      height: size,
      format: gl.LUMINANCE,
      data: pickRandom()
    })
  }

  return { target, texture, update }
}
