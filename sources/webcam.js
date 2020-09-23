import Video from './video.js'

export default gl => Video(gl, {
  setup: async v => {
    v.autoplay = true

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        resizeMode: 'crop-and-scale',
        facingMode: 'user',
        frameRate: 24,
        width: 144,
        height: 144
      }
    })

    v.srcObject = stream
  },
  stop: v => {
    v.srcObject.getTracks().forEach(track => track.stop())
    v.srcObject = null
  }
})
