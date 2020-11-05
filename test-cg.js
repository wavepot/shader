const videos = [
  'oHg5SJYRHA0', // rickroll
  'FJ3N_2r6R-o', // hitler
  'guVAeFs5XwE', // neo
]

export default async c => {
  const g = await c.import([
    'webcam',
    'youtube',
    'oscilloscope',
    'spectrogram',
    'spectrum',
    'waveform',
    'pixelmess',
    'intensity',
    'sorting',
    'effects',
    'glitch',
    'stripes',
    'wobble',
    'rotate',
    'mirror',
    'pulse',
  ])

  return c => {
    c(
      c => c.clear(),
      // c => g.webcam(c),
      c => c(
        c => c(
          c => g.youtube(c),
          c => g.mirror(c, { times: (Math.sin(c.t*.2)/2+.6)*4.5 }),
          // c => g.sorting(c),
          // c => g.rotate(c, { speed: .1, zoom: .001 }),
        ),
        // c => c(c => g.spectrogram(c)),
        // c => c(c=>g.spectrogram(c)),
        // c => c(
        //   c => g.webcam(c),
        //   // c => g.pixelmess(c, { size: 20 }),
        //   c => g.stripes(c),
        //   c => g.wobble(c, { speed: .1 }),
        // ),
        c => g.glitch(c),
        // c => g.pulse(c),
      ),
      // c=> c(c=> g.waveform(c)),
      // c => g.oscilloscope(c)
      // c => g.spectrum(c)
    )

    if (((c.frame % 2)|0) === 0) { // videos only need 30fps
      c.sources.webcam.update()
      c.sources.youtube.update()
    }
    // c.sources.audio.update()

    if (c.frame === 0 || (c.frame % (60*3) === 0 && Math.random() > .5)) {
      c.sources.youtube.set(videos[Math.random() * videos.length | 0])
    }

    if (c.frame % 3 == 0) {
      c.sources.noise64.update()
      c.sources.noise256.update()
    }
  }
}
