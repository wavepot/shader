export const getContext = (canvas, { alpha = false, antialias = false } = {}) => {
  const gl = canvas.getContext('webgl2', { alpha, antialias })
  gl.getExtension('EXT_color_buffer_float')
  return gl
}

export const createShader = (gl, { type, src }) => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, src.trim())
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(shader))
  return shader
}

export const compileProgram = (gl, {
  vertex,
  fragment,
  buffers = [],
  attrs = {},
  uniforms = {},
  cleanup = true
}) => {
  const program = gl.createProgram()
  if (typeof vertex === 'string') {
    vertex = createShader(gl, { type: gl.VERTEX_SHADER, src: vertex })
  }
  if (typeof fragment === 'string') {
    fragment = createShader(gl, { type: gl.FRAGMENT_SHADER, src: fragment })
  }
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  buffers.forEach(([buffer, _attrs]) => {
    Object.entries(_attrs).forEach(([key, value]) => {
      value.buffer = buffer
      attrs[key] = value
    })
  })
  const vao = createVertexArray(gl, program, attrs)
  gl.linkProgram(program)
  setUniforms(gl, program, uniforms)
  gl.useProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program))
  if (cleanup) {
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
  }
  program.vao = vao
  return program
}

export const putBuffer = (gl, {
  type = gl.ARRAY_BUFFER,
  buffer = gl.createBuffer(),
  data,
  usage = gl.STATIC_DRAW
}) => {
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, data, usage)
  gl.bindBuffer(type, null)
  return buffer
}

export const putTexture = (gl, {
  texture = createTexture(gl),
  target = gl.TEXTURE_2D,
  level = 0,
  internal = gl.RGBA,
  width = 1,
  height = 1,
  border = 0,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  flipY = false,
}) => {
  gl.bindTexture(target, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texImage2D(target, level, internal, width, height, border, format, type, data)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.bindTexture(target, null)
}

export const putTexture1 = (gl, {
  texture = createTexture(gl),
  target = gl.TEXTURE_2D,
  level = 0,
  internal = gl.RGBA,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  flipY = false,
}) => {
  gl.bindTexture(target, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texImage2D(target, level, internal, format, type, data)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.bindTexture(target, null)
}

export const putSubTexture = (gl, {
  texture = createTexture(gl),
  target = gl.TEXTURE_2D,
  level = 0,
  xOffset = 0,
  yOffset = 0,
  width = 1,
  height = 1,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  flipY = false,
}) => {
  gl.bindTexture(target, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texSubImage2D(target, level, xOffset, yOffset, width, height, format, type, data)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.bindTexture(target, null)
}

export const putSubTexture1 = (gl, {
  texture = createTexture(gl),
  target = gl.TEXTURE_2D,
  level = 0,
  xOffset = 0,
  yOffset = 0,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  flipY = false,
}) => {
  gl.bindTexture(target, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texSubImage2D(target, level, xOffset, yOffset, format, type, data)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.bindTexture(target, null)
}

export const createTexture = (gl, {
  texture = gl.createTexture(),
  target = gl.TEXTURE_2D,
  level = 0,
  internal = gl.RGBA,
  width = 1,
  height = 1,
  border = 0,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  min = gl.NEAREST,
  mag = gl.NEAREST,
  wrap_s = gl.CLAMP_TO_EDGE,
  wrap_t = gl.CLAMP_TO_EDGE,
  flipY = false,
}) => {
  gl.bindTexture(target, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texImage2D(target, level, internal, width, height, border, format, type, data)
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, min)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, mag)
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap_s)
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap_t)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  gl.bindTexture(target, null)
  return texture
}

export const createTexture3D = (gl, {
  texture = gl.createTexture(),
  target = gl.TEXTURE_3D,
  level = 0,
  internal = gl.RGBA,
  width,
  height,
  depth,
  border = 0,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
  data = null,
  min = gl.NEAREST,
  mag = gl.NEAREST,
  wrap_s = gl.CLAMP_TO_EDGE,
  wrap_t = gl.CLAMP_TO_EDGE,
  mipmap = false,
}) => {
  gl.bindTexture(target, texture)
  gl.texImage3D(target, level, internal, width, height, depth, border, format, type, data)
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, min)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, mag)
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrap_s)
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrap_t)
  gl.bindTexture(target, null)
  return texture
}

export const blitTexture = (gl, {
  target = gl.TEXTURE_2D,
  texture,
  buffer,
  data,
  level = 0,
  xOffset = 0,
  yOffset = 0,
  width,
  height,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
}) => {
  gl.bindTexture(target, texture)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, buffer)
  gl.bufferData(gl.PIXEL_UNPACK_BUFFER, data, gl.DYNAMIC_DRAW)
  gl.texSubImage2D(target, level, xOffset, yOffset, width, height, format, type, 0)
  gl.bindTexture(target, null)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
}

export const blitTexture3D = (gl, {
  target = gl.TEXTURE_3D,
  texture,
  buffer,
  data,
  level = 0,
  xOffset = 0,
  yOffset = 0,
  zOffset = 0,
  width,
  height,
  depth = 1,
  format = gl.RGBA,
  type = gl.UNSIGNED_BYTE,
}) => {
  gl.bindTexture(target, texture)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, buffer)
  gl.bufferData(gl.PIXEL_UNPACK_BUFFER, data, gl.DYNAMIC_DRAW)
  gl.texSubImage3D(target, level, xOffset, yOffset, zOffset, width, height, depth, format, type, 0)
  gl.bindTexture(target, null)
  gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null)
}

const bufferMap = new Map

export const createVertexArray = (gl, program, attrs = {}) => {
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  Object.entries(attrs).forEach(([name, {
    buffer,
    type = gl.ARRAY_BUFFER,
    size = 2,
    format = gl.SHORT,
    normalized = false,
    stride = 0,
    offset = 0,
  }], loc) => {
    if (!(buffer instanceof WebGLBuffer)) {
      if (!bufferMap.has(buffer)) {
        const key = buffer
        buffer = putBuffer(gl, { data: buffer })
        bufferMap.set(key, buffer)
      } else {
        buffer = bufferMap.get(buffer)
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bindAttribLocation(program, loc, name)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, format, normalized, stride, offset)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
  })
  gl.bindVertexArray(null)
  return vao
}

export const setUniforms = (gl, program, uniforms = {}) => {
  gl.useProgram(program)
  for (const [key, [type, value]] of Object.entries(uniforms)) {
    gl['uniform' + type](gl.getUniformLocation(program, key), value)
  }
  gl.useProgram(null)
}

export const setTextures = (gl, textures = []) => {
  textures.forEach((texture, i) => {
    gl.activeTexture(gl.TEXTURE0 + i)
    gl.bindTexture(texture.target, texture.texture)
  })
}

export const draw = (gl, {
  program,
  width,
  height,
  fbo = null,
  first = 0,
  count = 4,
  type = gl.TRIANGLE_STRIP,
  textures = [],
  uniforms = {},
}) => {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.viewport(0, 0, width, height)

  setUniforms(gl, program, uniforms)
  setTextures(gl, textures)

  gl.useProgram(program)
  gl.bindVertexArray(program.vao)

  gl.drawArrays(type, first, count)

  gl.bindVertexArray(null)
  gl.useProgram(null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

export const createScreen = (gl, {
  width,
  height,
  wrap_s = gl.REPEAT,
  wrap_t = gl.REPEAT,
}) => {
  const textures = [1,2].map(() => createTexture(gl, {
    width,
    height,
    wrap_s,
    wrap_t,
    // min: gl.LINEAR,
    // mag: gl.LINEAR,
  }))

  let textureSwapIndex = 0
  let targetTexture = textures[textureSwapIndex]
  let sourceTexture = textures[1 - textureSwapIndex]

  const fbo = gl.createFramebuffer()
  const rbo = gl.createRenderbuffer()

  const screen = {
    fbo,
    target: gl.TEXTURE_2D,
    texture: sourceTexture,
    start: () => {
      textureSwapIndex = 0
    },
    update: () => {
      targetTexture = textures[textureSwapIndex]
      textureSwapIndex = 1 - textureSwapIndex
      sourceTexture = textures[textureSwapIndex]
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0)
      screen.texture = sourceTexture
      gl.viewport(0, 0, width, height)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    },
    draw: (targetFbo = null) => {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo)
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, targetFbo)
      gl.blitFramebuffer(
        0, 0, width, height,
        0, 0, width, height,
        gl.COLOR_BUFFER_BIT,
        gl.NEAREST
      )
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null)
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
    }
  }

  screen.screen = screen

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.bindRenderbuffer(gl.RENDERBUFFER, rbo)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)

  return screen
}

export const compileModule = (gl, context, program) => {
  let opts

  const { width, height } = context

  if (typeof program === 'function') {
    // unpack opts sugar
    opts = program(context)
    if (typeof opts.type === 'string') {
      opts.type = gl[opts.type]
    }
    if (typeof opts.vertex === 'string') {
      // unpack program sugar
      opts.uniforms = {
        ...(opts.uniforms ?? {}),
        ...context.uniforms,
      }

      opts = {
        program: compileProgram(gl, opts),
        type: opts.type,
        count: opts.count,
        textures: opts.textures,
        draw: opts.draw,
        update: opts.update,
      }
    }
    if (opts.textures) {
      if (typeof opts.textures === 'function') {
        const textures = opts.textures
        opts.texturesFn = c => {
          return Object.entries(textures(c))
            .map(([key, tex], i) => {
              setUniforms(gl, opts.program, { [key]: ['1i', i] })
              return tex
            })
        }
        delete opts.textures
      } else {
        opts.textures = Object.entries(opts.textures)
          .map(([key, tex], i) => {
            setUniforms(gl, opts.program, { [key]: ['1i', i] })
            return tex
          })
      }
    }
    opts = { width, height, ...opts }
  } else {
    opts = { width, height, program }
  }

  return (...extra) => {
    extra = Object.assign({}, ...extra)
    const c = {
      ...context,
      ...extra,
      sources: {
        ...context.sources,
        ...extra,
      }
    }
    draw(gl, {
      textures: opts.textures ?? opts.texturesFn?.(c) ?? [],
      uniforms: {
        ...(opts.draw?.(c, c, c) ?? {}),
        ...context.uniforms,
      },
      ...opts,
      fbo: c.fbo
    })
  }
  // ,
  //   update: (...extra) => {
  //     const c = { ...context, ...Object.assign({}, ...extra) }
  //     opts.update?.(c, c, c)
  //   },
  //   stop: (...extra) => {
  //     const c = { ...context, ...Object.assign({}, ...extra) }
  //     opts.stop?.(c, c, c)
  //   }
  // }
}
