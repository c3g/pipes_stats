import colors from './constants/colors'

export function normalizeData(data) {
  Object.entries(data.stats.byPipeline).forEach(([name, data]) => {
    data.color = colors[hash(name) % colors.length]
  })
  return data
}

function hash(name) {
  return [].slice
    .call(name)
    .map(c => c.charCodeAt(0))
    .reduce((acc, cur) => acc + cur, 0)
}
