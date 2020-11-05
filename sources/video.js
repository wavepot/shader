import * as GL from '../gl.js'
import { getFetchUrl } from '../../server-api.js'

const Protocol = {
  youtube: {
    setup (v, url) {
      v.crossOrigin = 'anonymous'
      v.autoplay = true
      v.loop = true
    },
    src: url => getFetchUrl(url)
  }
}

const video = document.createElement('video')
video.volume = 0.000000000000001

export default (gl, url) => {
  const [protocol, id] = url.split(':')

  Protocol[protocol].setup(video, url)

  let src = Protocol[protocol].src(url)
  video.src = src

  const target = gl.TEXTURE_2D

  const texture = GL.createTexture(gl, {
    data: new Uint8Array([255,0,0,255]),
  })

  const noop = () => {}

  const updateVideo = () => {
    if (video.readyState < 2) return
    // NOTE: this used to be putSubTexture1
    // but turns out putTexture1 is 4x-5x faster
    GL.putTexture1(gl, {
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
    if (video.readyState < 2) return
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
    // opts.stop?.(video)
  }

  return {
    video,
    target,
    texture,
    update,
    stop,
    set (newUrl) {
      let src = Protocol[protocol].src(url)
      video.src = src
    }
  }
}
