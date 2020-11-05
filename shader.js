import * as GL from './gl.js'
import Noise from './sources/noise.js'
// import Webcam from './sources/webcam.js'
import Video from './sources/video.js'
import VideoCanvas from './sources/video-canvas.js'
import { parseFn } from '../util.js'
import merge from './programs/merge.js'
import video from './programs/video.js'
import glitch from './programs/glitch.js'
import pixelmess from './programs/pixelmess.js'
import wobble from './programs/wobble.js'
import mirror from './programs/mirror.js'
import rotate from './programs/rotate.js'
import zoom from './programs/zoom.js'
import blend from './programs/blend.js'

self.t = 0
self.frame = 0
self.pixelRatio = window.devicePixelRatio

self.color = '#f00'
self.videos = {}
self.screens = []
self.scale = 1

Array.prototype.seq = function (x=1) {
  let N = this.length
  return this[(( (t*(1/(x))) % N + N) % N)|0]
}

export default class Shader {
  constructor (parent) {
    const canvas = document.createElement('canvas')
    canvas.className = 'shader-canvas'

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width*scale
    canvas.height = height*scale
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    canvas.style.position = 'absolute'
    canvas.style.imageRendering = 'pixelated'
    parent.appendChild(canvas)

    this.canvas = canvas
    this.gl = self.gl = GL.getContext(canvas)

    this.setup()
    this.resize()

    self.videoCanvas = VideoCanvas(gl)

    this.sources = self.sources = {
      // audio: Audio(gl, { size: 1024, depth: 60*8, src: './music/alpha_molecule.ogg', start: 43 }),
      // webcam: Webcam(gl),
      // youtube: Youtube(gl),
      noise64: Noise(gl, { size: 64 }),
      noise256: Noise(gl, { size: 256 }),
    }

    this.buffers = {
      quad: [
        new Int16Array([
          -1, -1, 0, 0,
          -1,  1, 0, 1,
           1, -1, 1, 0,
           1,  1, 1, 1,
        ]), {
        'a_pos': { stride: 8 },
        'a_st': { stride: 8, offset: 4 },
        }],
    }

    this.programs = {
      merge: GL.compileModule(gl, this, merge),
      blend: GL.compileModule(gl, this, blend),
      video: GL.compileModule(gl, this, video),
      glitch: GL.compileModule(gl, this, glitch),
      pixelmess: GL.compileModule(gl, this, pixelmess),
      wobble: GL.compileModule(gl, this, wobble),
      mirror: GL.compileModule(gl, this, mirror),
      rotate: GL.compileModule(gl, this, rotate),
      zoom: GL.compileModule(gl, this, zoom),
    }

    this.resize()
  }

  setup () {
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    this.clear()
  }

  clear () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  shaderFunc () {}

  tick () {
    t = this.time

    this.shaderFunc()

    screens.main.draw()

    screens_i = 1 // 0 is main

    this.frame = ++frame
    if (frame % 4 == 0) {
      this.sources.noise64.update()
      this.sources.noise256.update()
    }
  }

  stop () {
    Object.values(this.sources).forEach(s => s.stop?.())
  }

  resize () {
    let canvas = this.canvas
    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width*scale
    canvas.height = height*scale
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    this.width = this.canvas.width
    this.height = this.canvas.height
    this.resolution = [
      this.width,
      this.height,
      pixelRatio
    ]

    self.screens_i = 1
    self.screens = Array.from(Array(10), () => (new Screen(this)))
    self.screens.main = self.screens[0]

    // self.screens.forEach(screen => Object.assign(screen, this))
  }

  // NOTE: this code is wrong, but we are trading
  // correctness and complexity for simplicity and
  // improved user experience, hence we use
  // heuristics to parse out any shader related code.
  // The alternative would be AST parsing where in that
  // case we might as well build a new language, and we
  // don't want to go down that path.
  extractAndCompile (code) {
    let blocks = code.split('\n\n')

    const methods = Object.keys(Shader.api)

    const rest = []
    const ours = []

    blocks.forEach(block => {
      for (const m of methods) {
        if (block.includes(m + '(')) {
          ours.push(block)
          return
        }
      }
      rest.push(block)
    })

    code = ours.join('\n\n').trim()
    if (!code.length) {
      return { shaderFunc: null, rest: rest.join('\n\n') }
    }

    // compile
console.log(code)
    let func = new Function(
      ...methods,
      code
    ).bind(this, ...Object.values(Shader.api))

    return { shaderFunc: func, rest: rest.join('\n\n') }
  }
}

export class Screen {
  constructor (context) {
    Object.assign(this, context)
    this.screen = GL.createScreen(gl, this)
    this.fbo = this.screen.fbo
  }

  yt (id) {
    return this.vid('youtube:' + id)
  }

  vid (url) {
    let v = videos[url]
    if (!v) {
      v = videos[url] = Video(gl, url)
      this._video_url = url
    }
    if (this._video_url !== url) {
      v.set(url)
      this._video_url = url
    } else {
      if (frame % 2 === 0) {
        v.update()
      }
    }
    this.sources.video = v
    this.programs.video(this)
    return this
  }

  clear () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    return this
  }

  code () {
    let canvas = document.querySelector('canvas.editor')
    self.videoCanvas.update(canvas)
    this.sources.video = self.videoCanvas
    this.programs.video(this)
    return this
  }

  color (color) {
    if (color !== self.color) {
      self.color = color
      self.editor.setColor(color)
    }
  }

  glitch () {
    this.screen.update()
    this.programs.glitch(this)
    return this
  }

  pixelmess (size = 3) {
    this.screen.update()
    this.programs.pixelmess(this, { size: window.innerHeight / size / scale })
    return this
  }

  wobble (speed = 1) {
    this.screen.update()
    this.programs.wobble(this, { speed })
    return this
  }

  mirror (times = 4) {
    this.screen.update()
    this.programs.mirror(this, { times })
    return this
  }

  rotate (zoom = .1, speed = 1) {
    this.screen.update()
    this.programs.rotate(this, { zoom, speed })
    return this
  }

  zoom (times = 4) {
    this.screen.update()
    this.programs.zoom(this, { times })
    return this
  }

  noop () {
    return this
  }

  draw () {
    this.screen.draw()
    return this
  }

  merge (target = screens.main, shift) {
    target.screen.update()
    this.screen.update()
    this.programs.merge(target, { a: target, b: this, shift })
    return this
  }

  blend (target = screens.main) {
    target.screen.update()
    this.screen.update()
    this.programs.blend(target, { a: target, b: this })
    return this
  }
}

Shader.api = {}
const IGNORE_METHODS = ['constructor','out']
Object.getOwnPropertyNames(Screen.prototype)
.filter(method => !IGNORE_METHODS.includes(method))
.forEach(method => {
  const { args, argNames } = parseFn(Screen.prototype[method])
  Shader.api[method] = new Function(...args,
    `
return screens[screens_i++].${method}(${argNames})
    `
  )
})
