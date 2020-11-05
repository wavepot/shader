import { mat4, glMatrix } from './gl-matrix.js'
import Glu, { UNIFORM_TYPE } from './glu.js'
import Quad from './quad.js'
import Feed from './feed.js'
import Model from './model.js'
import Lathe from './vendor/lathe.js'
import parseStl from './stl.js'
import angleNormals from './vendor/angle-normals.js'

function rand (x=1) {
  x=Math.sin(x)*10e4
  return (x-Math.floor(x))*2-1
}

Array.prototype.seq = function (x=1) {
  let N = this.length
  return this[(( (t*(1/(x))) % N + N) % N)|0]
}

const lathe = new Lathe()
const latheModels = {}

const pointModels = {}

const randomPoints = {}

const { toRadian } = glMatrix

export default class Shader {
  constructor (parentElement) {
    this.canvas = document.createElement('canvas')
    this.glu = new Glu(this.canvas)
    this._targets = Array.from(Array(10), () => (this.glu.createTarget()))
    this._target = this._targets[0]
    this._target_i = 1
    this._verts = []
    this._frags = []
    this._source = {}
    this._compiled = {}
    this._programs = {}
    this._uniforms = {}
    this._models = {}
    let v = this._video = document.createElement('video')
    v.crossOrigin = 'anonymous'
    v.autoplay = true
    v.loop = true
    this._targets['video'] = { texture: this.glu.createTexture() }

    this._tri = {
      buffer: this.glu.createBuffer(
        new Int8Array([
          -1, -1, 0, 0,
          -1,  3, 0, 2,
           3, -1, 2, 0,
        ])
      ),
      matrix: mat4.create(),
      mode: 'TRIANGLES',
      size: 3,
      attrib: [
        ['a_pos',  'byte', 2, 4, 0],
        ['a_norm', 'byte', 2, 4, 2],
      ]
    }
    this._quad = {
      buffer: this.glu.createBuffer(
        new Int8Array([
          -1, -1, 0, 0,
          -1,  1, 0, 1,
           1, -1, 1, 0,
           1,  1, 1, 1,
        ])
      ),
      matrix: mat4.create(),
      mode: 'TRIANGLE_STRIP',
      size: 4,
      attrib: [
        ['a_pos',  'byte', 2, 4, 0],
        ['a_norm', 'byte', 2, 4, 2],
      ]
    }

    parentElement.appendChild(this.canvas)

    const returnIgnoreAll = () => this._ignoreAll
    this._ignoreAll =Object.fromEntries(
      Object.getOwnPropertyNames(this.constructor.prototype)
        .map(m => [m, returnIgnoreAll]))
    this._ignoreAll.random = (...args) => this.random(...args)
    this._ignoreAll.points = (...args) => this.points(...args)
    this._ignoreAll.quad = (...args) => this.quad(...args)
    this._ignoreAll.model = (...args) => this.model(...args)

    const returnThis = () => this
    this._ignoreNext =Object.fromEntries(
      Object.getOwnPropertyNames(this.constructor.prototype)
        .map(m => [m, returnThis]))
  }

  _compile () {
    let uniforms = []
    let fragment = []
    let vertex = []

    this._verts.forEach(([code, val], i) => {
      if (val) {
        let name = '_v' + i
        vertex.push(code.replaceAll('_', name))
        uniforms.push([name, val])
      } else {
        vertex.push(code)
      }
    })

    this._frags.forEach(([code, val], i) => {
      if (val) {
        let name = '_f' + i
        fragment.push(code.replaceAll('_', name))
        uniforms.push([name, val])
      } else {
        fragment.push(code)
      }
    })

    let u = uniforms.map(([name, val]) => (
      `uniform ${UNIFORM_TYPE[val.length]} ${name};`
    )).join('\n')

    this._source.vertex = this._source.vertex.replace('/* do uniforms */', u)
    this._source.vertex = this._source.vertex.replace('/* do code */',
      vertex.map((code) => (code + ';')).join('\n'))

    this._source.fragment = this._source.fragment.replace('/* do uniforms */', u)
    this._source.fragment = this._source.fragment.replace('/* do code */',
      fragment.map((code) => (code + ';')).join('\n'))

    const src = this._source.vertex + this._source.fragment
    this._program = this._programs[src]
    if (!this._program) {
      this._program = this._programs[src] = this.glu.createProgram(this._source)
    }
    this.glu.use(this._program)

    uniforms.forEach(([name, val]) => this.glu.set(this._program, name, val))

    this.glu.vertexAttribSetup(this._program, this._model)

    mat4.transpose(this._uniforms.u_model, this._uniforms.u_model)

    for (const [name, val] of Object.entries(this._uniforms)) {
      this.glu.set(this._program, name, val)
    }

    return this
  }

  set (name, val) {
    this._uniforms[name] = val
    return this
  }

  clear (targetIndex, truth = true) {
    this.glu.setTarget(this._targets[targetIndex])
    if (truth) this.glu.clear()
    return this
  }

  _reset () {
    this._aspect = this.glu.aspect
    this._verts = []
    this._frags = []
    return this
  }

  vert (code, val) {
    this._verts.push([code, val])
    return this
  }

  frag (code, val) {
    this._frags.push([code, val])
    return this
  }

  youtube (url) {
    return this.video('youtube:' + url)
  }

  video (url) {
    this.quad()

    this.read('video')
    // this.glu.setSource({ texture: this._video_tex })
    // .read(textureIndex)

    let v = this._video
    if (this._video_url !== url) {
      v.src = 'http://localhost:3000/fetch?url=' + encodeURIComponent(url)
      this._video_url = url
    } else {
      if (v.readyState >= 3) {
        this.glu.putTexture(v)
      }
    }

    return this
  }

  model (filename) {
    this._reset()
    let model = this._loadModel(filename)
    if (!model.buffer) return this._ignoreAll
    this._model = model
    this.vert('light = vec3(max(dot(u_light, norm), 0.0)) + 0.01')
    this._setupModel()
    return this.aspect().perspect(45).move()
  }

  quad () {
    this._reset()
    this._model = this._quad
    this.vert('light = vec3(1.,1.,1.)')
    this._setupModel()
    return this.aspect(1).perspect().move()
  }

  tri () {
    this._model = this._tri
    this.vert('light = vec3(1.,1.,1.)')
    return this._setupModel()
  }

  random (n, seed = 12345) {
    let id = n + '' + seed
    let points = randomPoints[id]
    if (!points) {
      points = Array.from(Array(n*3), (_, i) => [
        rand(seed*i),
        rand(seed*i+1),
        rand(seed*i+2),
      ]).flat().join(' ')
      randomPoints[id] = points
    }
    return this.points(points)
  }

  points (s) {
    this._reset()
    let model = pointModels[s]
    if (!model) {
      const array = s.split(' ')
        .map(parseFloat)
        .reduce((p, n, i) => {
          p[i/3|0] =
          p[i/3|0] || [0,0,0]
          p[i/3|0][i%3] = n
          return p
        }, [])
      const cells = Array.from(Array(array.length/3), (_, i) => {
        const p = i*3
        return [p,p+1,p+2]
      })
      const vertices = new Float32Array(array.flat())
      const normals = new Float32Array(angleNormals(cells, array).flat())
      model = { vertices, normals }
      model.matrix = mat4.create()
      model.mode = 'TRIANGLE_STRIP'
      model.size = array.length
      model.buffers = [
        [this.glu.createBuffer(model.vertices), [['a_pos',  'float', 3,0,0]]],
        [this.glu.createBuffer(model.normals),  [['a_norm', 'float', 3,0,0,true]]],
      ]
      pointModels[s] = model
    }
    this._model = model
    this.vert('light = vec3(max(dot(u_light, norm), 0.0)) + 0.01')
    this._setupModel()
    return this.aspect().perspect().move()
  }

  lathe (profile, sides) {
    this._reset()
    let model = latheModels[profile + sides]
    if (!model) {
      const array = profile.split(' ')
        .map(parseFloat)
        .reduce((p, n, i) => {
          p[i/2|0] =
          p[i/2|0] || {}
          p[i/2|0][i%2 === 0 ? 'x' : 'y'] = n
          return p
        }, [])
      const result = lathe.compute(array, sides)
      const [vertices, uvs, normals, indices] = result
      model = { vertices, uvs, normals, indices }
      model.matrix = mat4.create()
      model.mode = 'TRIANGLES'
      model.size = model.indices.length
      model.elements = this.glu.createElements(new Uint16Array(model.indices))
      model.buffers = [
        [this.glu.createBuffer(model.vertices), [['a_pos',  'float', 3,0,0]]],
        [this.glu.createBuffer(model.normals),  [['a_norm', 'float', 3,0,0,true]]],
        [this.glu.createBuffer(model.uvs),      [['a_uv',   'float', 3,0,0,true]]],
      ]
      latheModels[profile + sides] = model
    }
    this._model = model
    this.vert('light = vec3(max(dot(u_light, norm), 0.0)) + 0.01')
    this.frag('st = uv')
    this._setupModel()
    return this.aspect().perspect().move()
  }

  _setupModel () {
    this._source.vertex = Model.vertex
    this._source.fragment = Model.fragment
    this._uniforms.u_view = mat4.create()
    this._uniforms.u_model = mat4.clone(this._model.matrix)
    this._uniforms.u_light = [1,1,1]
    this._uniforms.u_color = [1,1,1,1]
    return this
  }

  thru () {
    return this.frag(`
      if (!any(bvec4(col))) {
        discard;
      }
    `)
  }

  color (col) {
    this._uniforms.u_color = col
    return this
  }

  light (pos) {
    this._uniforms.u_light = pos
    return this.frag(`
      col *= vec4(light, 1.0)
    `)
  }

  rotate (radians, axis=[0,1,0]) {
    mat4.rotate(
      this._uniforms.u_model,
      this._uniforms.u_model,
      toRadian(radians),
      axis)
    return this
  }

  aspect (x=this.glu.aspect) {
    this._aspect = x
    return this
  }

  perspect (fov=90, near=.1, far=200.) {
    mat4.perspective(
      this._uniforms.u_view,
      toRadian(fov),
      this._aspect,
      near,
      far)
    return this
  }

  zoom (x) {
    return this.move([0,0,x])
  }

  move (pos=[0,0,-1]) {
    mat4.translate(
      this._uniforms.u_view,
      this._uniforms.u_view,
      pos
    )
    return this
  }

  on (x=1, measure=1/4, count=x) {
    return (t/(measure*4)|0)%count === x-1
      ? this
      : this._ignoreNext
  }

  glitch (intensity = .1) {
    let i = (1-intensity).toFixed(1)
    return this.frag(`
      bool R = randf(t*3.)+randf(st.y*25.)-.5>${i};
      st.y += randf(100.+t*3.)+randf(st.y*10.)-.5>${i} ? randf(t*5.)>.5?.0:.03 : 0.;
      r_st.x += R ? rand(t, -0.05, 0.05) : 0.;
      g_st.x += R ? rand(t+10., -0.02, 0.02) : 0.;
      b_st.x += R ? rand(t+20., -0.02, 0.02) : 0.;
    `)
  }

  _loadModel (filename) {
    if (filename in this._models) return this._models[filename]
    const model = this._models[filename] = {}
    fetch(filename).then(async response => {
      const arrayBuffer = await response.arrayBuffer()
      const parsed = parseStl(arrayBuffer)
      model.vertices = parsed.vertices
      model.matrix = parsed.matrix
      model.mode = 'TRIANGLES'
      model.size = model.vertices.length / 6
      model.buffer = this.glu.createBuffer(model.vertices)
      model.attrib = [
        ['a_pos',  'float', 3, 24, 0],
        ['a_norm', 'float', 3, 24, 12],
      ]
    })
    return model
  }

  tex (targetIndex) {
    return this.read(targetIndex).frag('col *= texture(img, st)')
  }

  texrgba (targetIndex, swizzle = 'rgba') {
    this.read(targetIndex)
    this.frag(`
      vec2 r_st = vec2(0.,0.);
      vec2 g_st = vec2(0.,0.);
      vec2 b_st = vec2(0.,0.);
      vec2 a_st = vec2(0.,0.);
    `)
    this._frags.unshift(this._frags.pop())
    let s = swizzle.split('')
    return this.frag(`
      col *= vec4(
        texture(img, st + r_st).${s[0]},
        texture(img, st + g_st).${s[1]},
        texture(img, st + b_st).${s[2]},
        texture(img, st + a_st).${s[3]}
      );
    `)
  }

  blend (targetIndex, blendFunc) {
    return this.draw(targetIndex, 'blend', blendFunc)
  }

  read (targetIndex) {
    this.glu.setSource(this._targets[targetIndex])
    return this
  }

  write (targetIndex) {
    this.glu.setTarget(this._targets[targetIndex])
    return this
  }

  draw (targetIndex, mode = 'write', blendFunc) {
    this._compile()
    this.glu.setTarget(this._targets[targetIndex])
    this.glu.draw(this._model, mode, blendFunc)
    return this
  }

  blit (sourceIndex, targetIndex) {
    this.glu.blit(
      this._targets[sourceIndex],
      this._targets[targetIndex]
    )
    return this
  }
}
