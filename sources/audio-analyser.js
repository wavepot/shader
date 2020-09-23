export default ({
  audio = null,
  source = null,
  size = 1024,
  wave = [0,1].map(() => new Float32Array(size)),
  freq = [0,1].map(() => new Float32Array(size)),
} = {}) => {
  if (!source) {
    if (!audio) {
      audio = new AudioContext({ latencyHint: 'playback' })
    }
    source = audio.createBufferSource()
  } else {
    audio = source.context
  }

  // frequency analyser
  const splitter = audio.createChannelSplitter(2)
  const analysers = [0,1].map((_, i) => {
    const analyser = audio.createAnalyser()
    analyser.fftSize = size*2
    analyser.minDecibels = -100
    analyser.maxDecibels = -0
    analyser.smoothingTimeConstant = 0
    splitter.connect(analyser, i, 0)
    return analyser
  })

  // waveform analyser
  let inputBuffer = { getChannelData: () => [] }
  const gain = audio.createGain()
  gain.gain.value = 0.0
  gain.connect(audio.destination) // or node doesn't start
  const script = audio.createScriptProcessor(size, 2, 2)
  script.onaudioprocess = e => { inputBuffer = e.inputBuffer }
  script.connect(gain)

  // connect
  source.connect(script)
  source.connect(splitter)

  const getData = () => {
    wave[0].set(inputBuffer.getChannelData(0))
    wave[1].set(inputBuffer.getChannelData(1))
    analysers[0].getFloatFrequencyData(freq[0])
    analysers[1].getFloatFrequencyData(freq[1])
    // analysers[0].getFloatTimeDomainData(wave[0])
    // analysers[1].getFloatTimeDomainData(wave[1])
    return { wave, freq }
  }

  return {
    getData,
    source,
    audio,
    size,
    wave,
    freq,
  }
}
