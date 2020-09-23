import Stream from './stream-service.js'

const getUrl = id => `http://localhost:3000/fetch?url=youtube:${id.replace(/a-z-_/gi, '')}`

export default worker => {
  const video = document.createElement('video')
  video.volume = 0.000000000000001 // mute prevents video from autoplaying (wtf!)
  video.crossOrigin = 'anonymous'
  video.autoplay = true
  video.loop = true
  // video.style.zIndex = 1000
  // video.style.position = 'fixed'
  // document.body.appendChild(video)

  const stream = video.captureStream()

  const youtube = Stream({
    name: 'youtube',
    worker,
    stream,
  })

  youtube.set = id => {
    video.src = getUrl(id)
  }

  youtube.onstop = () => video.pause()

  return youtube
}
