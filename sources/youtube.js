import Video from './video.js'

const getUrl = id => `http://localhost:3000/fetch?url=youtube:${id.replace(/a-z-_/gi, '')}`

export default gl => Video(gl, {
  setup: v => {
    v.crossOrigin = 'anonymous'
    v.autoplay = true
    v.loop = true
  },
  methods: {
    set: (v, params) => {
      v.src = getUrl(params)
    }
  }
})
