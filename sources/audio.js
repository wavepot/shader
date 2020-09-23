import * as GL from '../gl.js'
import createAnalyser from './audio-analyser.js'

const fetchAudioBuffer = async (audio, url) => {
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const audioBuffer = await audio.decodeAudioData(arrayBuffer)
  return audioBuffer
}

export default (gl, { size = 1024, depth = 60, src = null, start = 0 } = {}) => {
  const analyser = createAnalyser({ size })

  let stop = () => {}

  if (src) {
    fetchAudioBuffer(analyser.audio, src).then(audioBuffer => {
      analyser.source.buffer = audioBuffer
      analyser.source.loop = true
      // analyser.source.loopStart = 23
      // analyser.source.loopEnd = 47.2
      analyser.source.start(0, start)
    })
    stop = () => analyser.source.stop()
  }

  const target = gl.TEXTURE_2D_ARRAY

  const data = new Float32Array(4 * analyser.size)

  const buffer = GL.putBuffer(gl, {
    type: gl.PIXEL_UNPACK_BUFFER,
    data: data.length,
    usage: gl.DYNAMIC_DRAW
  })

  const texture = GL.createTexture3D(gl, {
    target,
    width: analyser.size,
    height: 4,
    depth,
    internal: gl.R32F,
    format: gl.RED,
    type: gl.FLOAT
  })

  const update = () => {
    const { wave, freq } = analyser.getData()
    const y = analyser.size

    data.set(wave[0], 0*y)
    data.set(wave[1], 1*y)
    data.set(freq[0], 2*y)
    data.set(freq[1], 3*y)

    audio.offset = (audio.offset + 1) % depth

    GL.blitTexture3D(gl, {
      target,
      texture,
      buffer,
      data,
      zOffset: audio.offset,
      width: analyser.size,
      height: 4,
      format: gl.RED,
      type: gl.FLOAT
    })
  }

  const audio = {
    ...analyser,
    data,
    depth,
    buffer,
    target,
    texture,
    offset: -1,
    update,
    stop,
  }

  return audio
}
