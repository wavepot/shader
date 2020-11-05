import * as GL from './gl.js'
import Shader from './shader.js'
import Noise from './sources/noise.js'
import Audio from './sources/audio-worker.js'
import Video from './sources/video-worker.js'

const Sources = gl => {
  const sources = {}
  sources.audio = Audio(gl)
  sources.webcam = Video(gl)
  sources.youtube = Video(gl)
  sources.editor = Video(gl)
  sources.noise64 = Noise(gl, { size: 64 })
  sources.noise256 = Noise(gl, { size: 256 })

  sources.youtube.set = id => {
    postMessage({
      call: 'sourcecall',
      name: 'youtube',
      method: 'set',
      params: [id]
    })
  }

  return sources
}

const Buffers = gl => {
  const buffers = {}

  buffers.quad = [
    new Int16Array([
      -1, -1, 0, 0,
      -1,  1, 0, 1,
       1, -1, 1, 0,
       1,  1, 1, 1,
    ]), {
    'a_pos': { stride: 8 },
    'a_st': { stride: 8, offset: 4 },
  }]

  return buffers
}

let v = 0

const worker = {
  setup (opts) {
    worker.opts = opts
    worker.canvas = opts.canvas
    const gl = worker.gl = worker.gl ?? GL.getContext(opts.canvas, opts)
    const sources = worker.sources = worker.sources ?? Sources(gl)
    const buffers = worker.buffers = worker.buffers ?? Buffers(gl)
    worker.cg = Shader({ gl, ...opts, buffers, sources })
  },

  async load ({ filename }) {
  // try {
    worker.filename = filename

    v++ // cache bust

    worker.cg.import = async (modules) =>
      Object.fromEntries(await Promise.all(modules.map(async (name) => {
        const path = new URL('programs/' + name + '.js', worker.filename).href
        const mod = await import(path + '?v=' + v)
        return [name, GL.compileModule(worker.gl, worker.cg, mod.default)]
      })))

    const mod = await import(filename + '?v=' + v)

    worker.fn = await mod.default(worker.cg)

    worker.tick = ms => {
      worker.animFrame = requestAnimationFrame(worker.tick)
      worker.cg.t = worker.cg.time = ms*0.001
      worker.cg.n = worker.cg.frame
      // if (worker.cg.n % 3 === 0) {

      // try {
      worker.fn(worker.cg)
      // }
      // } catch (error) {
        // worker.onerror({ error })
      // }
      worker.cg.frame++
    }

    worker.start()
  // } catch (error) {
    // worker.onerror({ error })
  // }
  },

  start () {
    worker.stop()
    if (!worker.tick) {
      return setTimeout(worker.start, 500)
    }
    worker.animFrame = requestAnimationFrame(worker.tick)
  },

  stop () {
    cancelAnimationFrame(worker.animFrame)
  },

  onerror ({ error }) {
    // worker.stop()
    postMessage({ call: 'onerror', error })
  },

  onresize ({ width, height }) {
    worker.canvas.width = width
    worker.canvas.height = height
    worker.setup(worker.opts)
    worker.load(worker)
  },

  onsourcedata ({ name, data }) {
    worker.cg?.sources[name].ondata({ data })
  },
}

onmessage = ({ data }) => worker[data.call](data)
addEventListener('error', worker.onerror)
addEventListener('unhandledrejection', ({ reason: error }) => worker.onerror({ error }))
