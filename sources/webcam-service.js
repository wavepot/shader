import Stream from './stream-service.js'

export default async (worker) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      resizeMode: 'crop-and-scale',
      facingMode: 'user',
      frameRate: 24,
      width: 1280, //144,
      height: 720, //144
    }
  })

  const webcam = Stream({
    name: 'webcam',
    worker,
    stream,
  })

  return webcam
}
