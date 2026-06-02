import React from 'react'
import { PieChart, Pie, Cell, Sector } from 'recharts'

import AutoSizer from './AutoSizer'
import COLORS from '../constants/colors'
import hexToRGBA from '../utils/hexToRGBA'

const OPACITY_PIE  = 0.2
const OPACITY_TEXT = 0.3
const RADIAN = Math.PI / 180

let containers = []

class ClusterPieChart extends React.Component {
  state = { activeCluster: undefined, selectedCluster: undefined }

  containerRef = React.createRef()

  onMouseEnter = (data) => {
    if (this.state.selectedCluster) return
    this.setState({ activeCluster: data.name })
  }

  onMouseLeave = () => {
    if (this.state.selectedCluster) return
    this.setState({ activeCluster: undefined })
  }

  onMouseMove = (data) => {
    if (this.state.selectedCluster) return
    if (this.state.activeCluster !== data.name)
      this.setState({ activeCluster: data.name })
  }

  onClick = (data) => {
    this.setState(prevState => {
      const next = prevState.selectedCluster === data.name ? undefined : data.name
      this.props.onPinChange && this.props.onPinChange(next)
      return { selectedCluster: next, activeCluster: undefined }
    })
  }

  onDocumentMouseMove = (ev) => {
    if (this.state.selectedCluster) return
    const { target } = ev
    const className = String((target.className !== undefined && target.className.baseVal) || target.className)
    if (this.state.activeCluster
      && !containers.some(c => c.contains(target))
      && !className.includes('recharts')
    ) {
      this.setState({ activeCluster: undefined })
    }
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onDocumentMouseMove)
    if (this.containerRef.current) containers.push(this.containerRef.current)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onDocumentMouseMove)
    containers = containers.filter(c => c !== this.containerRef.current)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.previousData === undefined
      || this.previousData !== nextProps.data
      || this.state.activeCluster !== nextState.activeCluster
      || this.state.selectedCluster !== nextState.selectedCluster
    )
  }

  render() {
    const { data } = this.props
    const { activeCluster, selectedCluster } = this.state
    const effectiveCluster = selectedCluster || activeCluster
    this.previousData = data

    return (
      <div ref={this.containerRef}>
        <AutoSizer disableHeight>
          {({ width }) => {
            const total = data.reduce((s, d) => s + (d.value || 0), 0)
            const adjustedPositions = computeLabelPositions(data, width * 0.5, 175, 80,
              d => total > 0 && (d.value || 0) / total * 360 >= 7)
            return (
              <PieChart width={width} height={350} onMouseLeave={this.onMouseLeave}>
                <Pie
                  data={data}
                  cx='50%'
                  cy='50%'
                  dataKey='value'
                  innerRadius={40}
                  outerRadius={80}
                  label={props => renderLabel(props, effectiveCluster, adjustedPositions)}
                  labelLine={false}
                  isAnimationActive={false}
                  onMouseEnter={this.onMouseEnter}
                  onMouseMove={this.onMouseMove}
                  onClick={this.onClick}
                  style={{ cursor: 'pointer' }}
                >
                  {data.map((entry, i) =>
                    <Cell
                      key={entry.name}
                      fill={
                        effectiveCluster === undefined ? COLORS[i % COLORS.length] :
                        entry.name === effectiveCluster ? COLORS[i % COLORS.length] :
                        hexToRGBA(COLORS[i % COLORS.length], OPACITY_PIE)
                      }
                    />
                  )}
                </Pie>
              </PieChart>
            )
          }}
        </AutoSizer>
      </div>
    )
  }
}

function computeLabelPositions(data, cxPx, cyPx, outerRadius, filter) {
  const LINE_HEIGHT = 16
  const r = outerRadius + 20
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  if (total === 0) return {}

  let cum = 0
  const labeled = []
  data.forEach(d => {
    const value = d.value || 0
    const midAngle = (cum + value / 2) / total * 360
    cum += value
    if (filter && !filter(d)) return
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    labeled.push({ name: d.name, naturalEy: cyPx + r * sin, isRight: cos >= 0 })
  })

  const result = {}
  for (const isRight of [true, false]) {
    const side = labeled.filter(e => e.isRight === isRight)
    if (side.length === 0) continue
    side.sort((a, b) => a.naturalEy - b.naturalEy)

    let needsSpread = false
    for (let i = 1; i < side.length; i++) {
      if (side[i].naturalEy - side[i - 1].naturalEy < LINE_HEIGHT) { needsSpread = true; break }
    }

    if (!needsSpread) {
      side.forEach(e => { result[e.name] = e.naturalEy })
    } else {
      const center = side.reduce((s, e) => s + e.naturalEy, 0) / side.length
      const top = center - ((side.length - 1) * LINE_HEIGHT) / 2
      side.forEach((e, i) => { result[e.name] = top + i * LINE_HEIGHT })
    }
  }
  return result
}

function renderLabel(props, activeCluster, adjustedPositions) {
  const { cx, cy, midAngle, outerRadius, startAngle, endAngle, fill, payload } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + outerRadius * cos
  const sy = cy + outerRadius * sin
  const mx = cx + (outerRadius + 20) * cos
  const my = cy + (outerRadius + 20) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 25
  const ey = (adjustedPositions && adjustedPositions[payload.name] !== undefined)
    ? adjustedPositions[payload.name] : my
  const textAnchor = cos >= 0 ? 'start' : 'end'
  const name = !payload.name ? '(Empty)' : payload.name
  const textStyle = { fontWeight: payload.selected ? 'bold' : 'normal' }
  if (payload.name === 'null') textStyle.fontStyle = 'italic'
  const angle = endAngle - startAngle
  const isActive = payload.name === activeCluster
  const someActive = activeCluster !== undefined
  if (angle < 7 && !isActive) return null

  return (
    <g>
      {payload.selected && (
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle}
          innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
      )}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none' />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none' />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 3} textAnchor={textAnchor}
        fill={`rgba(51, 51, 51, ${isActive ? 1 : someActive ? OPACITY_TEXT : 1})`}
        style={textStyle}
      >
        {name} ({payload.value})
      </text>
    </g>
  )
}

export default ClusterPieChart
