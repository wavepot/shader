import HyperFn from '../hyper.js'

describe("fn = HyperFn({ context, execute })", () => {
  it("should return a hyper function", () => {
    const context = {}
    const execute = () => {}
    const fn = HyperFn({ context, execute })
    expect(fn).to.be.a('function')
  })
})

describe("fn(c => ...)", () => {
  it("should execute function with context", () => {
    const context = { x: 5 }
    const execute = (fn, context) => fn(context)
    const fn = HyperFn({ context, execute })

    let x = 0
    fn(c => { x = ++c.x })

    expect(x).to.equal(6)
  })

  it("should execute moveDown", () => {
    const context = { x: 5 }
    const execute = (fn, context) => fn(context)
    const moveDown = fn => {
      fn.x++
    }
    const fn = HyperFn({ context, execute, moveDown })

    let x = 0
    fn(c => { x = ++c.x })

    expect(x).to.equal(7)
  })

  it("should execute moveSide", () => {
    const context = { x: 5, y: 10 }
    const execute = (fn, context) => fn(context)
    const moveDown = fn => {
      fn.x++
    }
    const moveSide = fn => {
      fn.y++
    }
    const fn = HyperFn({
      context,
      execute,
      moveDown,
      moveSide
    })

    let x = 0, y = 0
    fn(
      c => { x = ++c.x },
      c => { y = ++c.y },
    )

    expect(x).to.equal(7)
    expect(y).to.equal(12)
  })

  it("should execute moveUp", () => {
    const context = { x: 5, y: 10 }
    const execute = (fn, context) => fn(context)
    const moveDown = fn => {
      fn.x++
    }
    const moveSide = fn => {
      fn.y++
    }
    const moveUp = (parent, fn) => {
      parent.x = fn.x
    }
    const fn = HyperFn({
      context,
      execute,
      moveDown,
      moveSide,
      moveUp,
    })

    let x = 0, y = 0
    fn(
      c => { x = ++c.x },
      c => { y = ++c.y },
    )

    expect(x).to.equal(7)
    expect(y).to.equal(12)
    expect(context.x).to.equal(6)
  })


  it("conformity simple", () => {
    const execute = (fn, context) => fn(context)
    let screens = []
    const screen = { content: '' }
    screens.push(screen)
    const context = { screen }
    const moveDown = fn => {
      const screen = { content: '' }
      screens.push(screen)
      fn.screen = screen
    }
    const moveSide = fn => {
      fn.screen.content += ','
    }
    const moveUp = (parent, fn) => {
      parent.screen.content += ` M[${fn.screen.content}]`
    }
    const fn = HyperFn({
      context,
      execute,
      moveDown,
      moveSide,
      moveUp,
    })

    fn(
      c => c(
        c => { c.screen.content += 'a' },
        c => { c.screen.content += 'b' },
      ),
      c => c(
        c => { c.screen.content += 'c' },
      )
    )

    expect(screens.length).to.equal(4)
    expect(screens[0].content).to.equal(' M[ M[a,b] M[c]]')
  })

  it("conformity deep", () => {
    const execute = (fn, context) => fn(context)
    let screens = []
    const screen = { content: '' }
    screens.push(screen)
    const context = { screen }
    const moveDown = fn => {
      const screen = { content: '' }
      screens.push(screen)
      fn.screen = screen
    }
    const moveSide = fn => {
      fn.screen.content += ','
    }
    const moveUp = (parent, fn) => {
      parent.screen.content += ` M[${fn.screen.content}]`
    }
    const fn = HyperFn({
      context,
      execute,
      moveDown,
      moveSide,
      moveUp,
    })

    fn(
      c => c(
        c => { c.screen.content += 'a' },
        c => { c.screen.content += 'b' },
      ),
      c => c(
        c => c(
          c => { c.screen.content += 'c' },
          c => { c.screen.content += 'd' },
        ),
        c => { c.screen.content += 'e' },
      )
    )

    expect(screens.length).to.equal(5)
    expect(screens[0].content).to.equal(' M[ M[a,b] M[ M[c,d]e]]')
  })
})
