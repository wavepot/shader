import * as GL from '../gl.js'

export default (gl, opts) => {
  const video = document.createElement('video')
  video.volume = 0.000000000000001

  opts?.setup(video)

  const target = gl.TEXTURE_2D

  const texture = GL.createTexture(gl, {
    data: new Uint8Array([255,0,0,255]),
  })

  const noop = () => {}

  const updateVideo = () => {
    GL.putSubTexture1(gl, {
      texture,
      data: video,
      // flipY: true
    })
  }

  let updateStrategy = noop

  video.onemptied = e => {
    updateStrategy = noop
  }

  video.onplaying = e => {
    GL.putTexture1(gl, {
      texture,
      data: video,
      // flipY: true
    })

    updateStrategy = updateVideo
  }

  const update = () => updateStrategy()

  const stop = () => {
    video.pause()
    opts.stop?.(video)
  }

  const methods = Object.fromEntries(
    Object.entries(opts.methods ?? {})
      .map(([key, method]) => [
        key,
        (...args) => method(video, ...args)
      ]))

  return {
    ...methods,
    video,
    target,
    texture,
    update,
    stop
  }
}
