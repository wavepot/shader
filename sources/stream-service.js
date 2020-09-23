export default ({ worker, stream, name }) => {
  const [track] = stream.getVideoTracks()

  const noop = () => {}

  const service = {
    update: noop,
    stop: noop,
  }

  const beginCapture = track => {
    const capture = new ImageCapture(track)

    service.update = () => {
      capture.grabFrame().then(data => {
        worker.postMessage({
          call: 'onsourcedata',
          name,
          data,
        }, [data])
      }).catch(noop)
    }

    service.stop = () => {
      track.stop()
      service.onstop?.()
    }
  }

  if (!track) {
    stream.onaddtrack = ({ track }) => {
      beginCapture(track)
    }
  } else {
    beginCapture(track)
  }

  return service
}
