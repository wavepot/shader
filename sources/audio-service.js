import createAnalyser from './audio-analyser.js'
import Shared32Array from './shared-array-buffer.js'

const fetchAudioBuffer = async (audio, url) => {
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const audioBuffer = await audio.decodeAudioData(arrayBuffer)
  return audioBuffer
}

export default (worker, { size = 1024, depth = 60*8, src = null, start = 0 } = {}) => {
  const audio = {
    size,
    depth,
  }

  audio.analyser = createAnalyser({ size })

  audio.stop = () => {}

  if (src) {
    fetchAudioBuffer(audio.analyser.audio, src).then(audioBuffer => {
      audio.analyser.source.buffer = audioBuffer
      audio.analyser.source.loop = true
      // analyser.source.loopStart = 23
      // analyser.source.loopEnd = 47.2
      audio.analyser.source.start(0, start)
    })
    audio.stop = () => audio.analyser.source.stop()
  }

  const data = audio.data = new Shared32Array(4 * size)

  setTimeout(() => {
    worker.postMessage({
      call: 'onsourcedata',
      name: 'audio',
      data,
    })
  }, 1000)

  audio.update = () => {
    const { wave, freq } = audio.analyser.getData()

    audio.data.set(wave[0], 0*size)
    audio.data.set(wave[1], 1*size)
    audio.data.set(freq[0], 2*size)
    audio.data.set(freq[1], 3*size)
  }

  return audio
}
