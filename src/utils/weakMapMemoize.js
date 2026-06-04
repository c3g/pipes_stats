
// eslint-disable-next-line new-cap
const createMap = (type) => (type === undefined ? new WeakMap() : new type())

const weakMapMemoize = (...outerArgs) => {
  const fn     = outerArgs.length === 2 ? outerArgs[1] : outerArgs[0]
  const config = outerArgs.length === 2 ? outerArgs[0] : []

  const baseMap = createMap(config[0])

  return (...args) => {

    let currentMap = baseMap

    for (let i = 0; i < fn.length - 1; i++) {

      if (!currentMap.has(args[i]))
        currentMap.set(args[i], createMap(config[i + 1]))

      currentMap = currentMap.get(args[i])
    }

    const lastArg = args[args.length - 1]

    if (currentMap.has(lastArg))
      return currentMap.get(lastArg)

    const result = fn(...args)

    currentMap.set(lastArg, result)

    return result
  }
}
export default weakMapMemoize
