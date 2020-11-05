export default ({ worker, stream, name }) => {
  let _track

  const [track] = stream.getVideoTracks()

  _track = track

  const noop = () => {}

  const service = {
    update: noop,
    stop: noop,
    setStream (stream) {
      _track.enabled = false
      _track.onmute = noop
      const [track] = stream.getVideoTracks()
      _track = track
      track.enabled = true
      maybeBeginCapture(track)
    }
  }

  const beginCapture = track => {
    const capture = new ImageCapture(track)

    track.onmute = () => {
      track.onmute = noop
      service.update = noop
      maybeBeginCapture(track)
    }

    service.update = () => {
      if (!track.enabled) return
      capture.grabFrame().then(data => {
        worker.postMessage({
          call: 'onsourcedata',
          name,
          data,
        }, [data])
      }).catch(error => {
        if (error) {
          console.error(name, error)
          console.dir(track)
          console.log(track.readyState, track.enabled, track.muted)
        }
      })
    }

    service.stop = () => {
      track.stop()
      service.onstop?.()
    }
  }

  const maybeBeginCapture = (track) => {
    if (track.muted) {
      track.onunmute = () => beginCapture(track)
    } else {
      beginCapture(track)
    }
  }

  if (!track) {
    stream.onaddtrack = ({ track }) => maybeBeginCapture(track)
  } else {
    maybeBeginCapture(track)
  }

  return service
}
