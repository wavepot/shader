import Stream from './stream-service.js'

export default (worker, { stream }) => {
  const editor = Stream({
    name: 'editor',
    worker,
    stream
  })

  const update = () => editor.update()
  const stop = () => {}

  return {
    ...editor,
    update,
    stop,
  }
}
