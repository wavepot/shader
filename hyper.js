export default ({
  context,
  execute,
  before = () => {},
  moveDown = () => {},
  moveSide = () => {},
  moveUp = () => {},
}) => {
  const createHyperFn = (parent) => {
    const fn = (...args) => {
      if (parent === context) {
        before()
      }

      moveDown(fn)

      args.forEach((_fn, i) => {
        const hyperFn = createHyperFn(fn)
        const result = execute(_fn, hyperFn)
        if (result) {
          moveUp(fn, result)
        } else if (i < args.length - 1) {
          moveSide(fn)
        }
      })

      moveUp(parent, fn)

      return fn
    }

    Object.assign(fn, parent, { parent })

    return fn
  }

  return createHyperFn(context)
}
