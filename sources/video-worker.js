import * as GL from '../gl.js'

export default gl => {
  const video = {}

  video.target = gl.TEXTURE_2D
  // video.flipY = true
  video.data = new Uint8Array([255,0,0,255])
  video.texture = GL.createTexture(gl, video)

  const updateInitial = () => {
    if (!video.width) return
    GL.putTexture1(gl, video)
    video.update = () => {
    // console.log(video)
      if (video.data !== video.prevData) {
        video.prevData = video.data
        GL.putSubTexture1(gl, video)
      }
    }
  }

  video.ondata = ({ data }) => {
    video.data = data
    if (video.width !== data.width) {
      video.width = data.width
      video.height = data.height
      video.update = updateInitial
    }
  }

  video.update = updateInitial

  return video
}
