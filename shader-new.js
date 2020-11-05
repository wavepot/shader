import * as GL from './gl.js'
import Hyper from './hyper.js'
import _merge from './programs/merge.js'

export default ({
  canvas,
  buffers,
  sources,
  gl = GL.getContext(canvas),
  pixelRatio = window.devicePixelRatio,
}) => {
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const context = {
    gl,
    frame: 0,
    time: 0,
    buffers,
    sources,
    clear: () => gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT),
  }

  let screenIndex = 0
  const screens = []
  const getScreen = context => {
    let screen = screens[screenIndex]
    if (!screen) {
      console.log('create screen')
      screen = GL.createScreen(gl, context)
      screens.push(screen)
      screen.index = screenIndex
    }
    screenIndex++
    return screen
  }

  context.resize = () => {
    context.width = canvas.width
    context.height = canvas.height
    context.resolution = [
      context.width,
      context.height,
      pixelRatio
    ]
    screens.forEach(screen => {
      //TODO: resize
    })
  }

  context.resize()

  context.merge = GL.compileModule(gl, context, _merge)

  context.moveDown = a => {
    a.screen = getScreen(a)
    a.fbo = a.screen.fbo
  }

  context.moveSide = (a) => {
    a.screen.update()
  }

  context.moveUp = (a, b) => {
    if (!a.screen) {
      b.screen.draw()
    } else {
      a.screen.update()
      b.screen.update()
      context.merge(a, { a, b })
    }
  }

  const execute = (fn, context) => {
    return fn(context, context, context)
  }

  context.before = () => {
    screenIndex = 0
  }

  return context

  // const hyper = Hyper({
  //   context,
  //   execute,
  //   before,
  //   moveDown,
  //   moveSide,
  //   moveUp,
  // })

  // return hyper
}
