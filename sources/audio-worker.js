import * as GL from '../gl.js'

export default (gl, { size = 1024, depth = 60*8 } = {}) => {
  const target = gl.TEXTURE_2D_ARRAY

  const data = new Float32Array(4 * size)

  const buffer = GL.putBuffer(gl, {
    type: gl.PIXEL_UNPACK_BUFFER,
    data: data.length,
    usage: gl.DYNAMIC_DRAW
  })

  const texture = GL.createTexture3D(gl, {
    target,
    width: size,
    height: 4,
    depth,
    internal: gl.R32F,
    format: gl.RED,
    type: gl.FLOAT
  })

  const ondata = ({ data }) => {
    audio.data = data
  }

  const update = () => {
    audio.offset = (audio.offset + 1) % depth

    GL.blitTexture3D(gl, {
      target,
      texture,
      buffer,
      data: audio.data,
      zOffset: audio.offset,
      width: size,
      height: 4,
      format: gl.RED,
      type: gl.FLOAT
    })
  }

  const audio = {
    size,
    depth,
    offset: -1,
    data,
    buffer,
    target,
    texture,
    ondata,
    update,
  }

  return audio
}
