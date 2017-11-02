function parseHex(value) {
  const hex = value.slice(1)
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ]
}
export default function hexToRGBA(color, opacity) {
  const rgb = parseHex(color)
  return `rgba(${rgb.join(', ')}, ${opacity})`
}
