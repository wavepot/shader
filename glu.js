export default class Glu {
  constructor (canvas) {
    this.canvas = canvas
    const gl = this.gl = canvas.getContext('webgl2', { antialias: false })
    gl.getExtension('EXT_color_buffer_float')
    gl.getExtension('EXT_shader_texture_lod')
    gl.getExtension('OES_standard_derivatives')
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.depthFunc(gl.LEQUAL)
    gl.blendEquation(gl.FUNC_ADD)
    gl.blendFunc(gl.ONE_MINUS_DST_ALPHA, gl.SRC_ALPHA)
    this.resize()
  }

  get aspect () {
    return this.gl.drawingBufferWidth / this.gl.drawingBufferHeight
  }

  resize () {
    const { gl } = this
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
    this.whiteTextureData = new Uint8Array(
      gl.drawingBufferWidth
    * gl.drawingBufferHeight * 4).fill(255)
    this.clear()
  }

  clear () {
    const { gl } = this
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  createProgram (src) {
    const { gl } = this
    const program = gl.createProgram()
    const vertex = this.createShader(gl.VERTEX_SHADER, src.vertex)
    const fragment = this.createShader(gl.FRAGMENT_SHADER, src.fragment)
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program))
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    return program
  }

  createShader (type, src) {
    const { gl } = this
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src.trim())
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader))
    return shader
  }

  createBuffer (data) {
    const { gl } = this
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    return buffer
  }

  createElements (data) {
    const { gl } = this
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    return buffer
  }

  createTexture (data = this.whiteTextureData) {
    const { gl } = this
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
  }

  putTexture (data) {
    const { gl } = this
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data)
  }

  createTarget () {
    const { gl } = this
    const fbo = gl.createFramebuffer()
    const rbo = gl.createRenderbuffer()
    const texture = this.createTexture()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.bindRenderbuffer(gl.RENDERBUFFER, rbo)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo)
    return { fbo, rbo, texture }
  }

  vertexAttribSetup (program, resource) {
    const { gl } = this
    let buffers = resource.buffers
    if (!buffers) buffers = [[resource.buffer, resource.attrib]]
    buffers.forEach(([buffer, attrib]) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      for (const [name, type, size, stride, offset, norm = false] of attrib) {
        const loc = gl.getAttribLocation(program, name)
        gl.vertexAttribPointer(loc, size, gl[type.toUpperCase()], norm, stride, offset)
        gl.enableVertexAttribArray(loc)
      }
    })
  }

  setSource (source) {
    const { gl } = this
    const { texture } = source
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
  }

  setTarget (target) {
    const { gl } = this
    if (!target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      return
    }
    const { fbo, texture } = target
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
  }

  draw (model, type = 'write', blendFuncStr = 'sa sa') {
    const { gl } = this
    if (type === 'write') {
      gl.disable(gl.BLEND)
      gl.enable(gl.DEPTH_TEST)
    } else if (type === 'blend') {
      gl.disable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      const blendFunc = blendFuncStr.split(' ')
      gl.blendFunc(
        gl[BLEND_FUNC[blendFunc[0]]],
        gl[BLEND_FUNC[blendFunc[1]]]
      )
    }
    if (model.elements) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.elements)
      gl.drawElements(gl[model.mode], model.size, gl.UNSIGNED_SHORT, 0)
    } else {
      gl.drawArrays(gl[model.mode], 0, model.size)
    }
  }

  blit (source, target) {
    const { gl } = this
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.fbo)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, target?.fbo)
    gl.blitFramebuffer(
      0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight,
      0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST
    )
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
  }

  use (program) {
    this.gl.useProgram(program)
  }

  set (program, name, value) {
    UNIFORM_SET_METHODS[UNIFORM_TYPE[value.length]](
      this.gl,
      program,
      UNIFORM_VALUE[value.length],
      name, value)
  }
}

export const UNIFORM_TYPE = {
  '16': 'mat4',
  '9': 'mat3',
  '4': 'vec4',
  '3': 'vec3',
  '2': 'vec2',
  '1': 'float',
  'undefined': 'float',
}

const UNIFORM_VALUE = {
  '16': '4fv',
  '9': '3fv',
  '4': '4fv',
  '3': '3fv',
  '2': '2fv',
  '1': '1fv',
  'undefined': '1f',
}

const setUniform = (gl, program, type, name, value) => {
  gl['uniform' + type](
    gl.getUniformLocation(program, name),
    value
  )
}

const setUniformMatrix = (gl, program, type, name, value) => {
  gl['uniformMatrix' + type](
    gl.getUniformLocation(program, name),
    false,
    value
  )
}

const UNIFORM_SET_METHODS = {
  'mat4': setUniformMatrix,
  'mat3': setUniformMatrix,
  'vec4': setUniform,
  'vec3': setUniform,
  'vec2': setUniform,
  'float': setUniform,
}

const BLEND_FUNC = {
  '0':    'ZERO',
  '1':    'ONE',
  'sc':   'SRC_COLOR',
  '1-sc': 'ONE_MINUS_SRC_COLOR',
  'dc':   'DST_COLOR',
  '1-dc': 'ONE_MINUS_DST_COLOR',
  'sa':   'SRC_ALPHA',
  '1-sa': 'ONE_MINUS_SRC_ALPHA',
  'da':   'DST_ALPHA',
  '1-da': 'ONE_MINUS_DST_ALPHA',
  'sas':  'SRC_ALPHA_SATURATE'
}
