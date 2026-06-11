import React from 'react'
import { PieChart, Pie, Cell, Sector } from 'recharts'

import AutoSizer from './AutoSizer'
import hexToRGBA from '../utils/hexToRGBA'

const OPACITY_PIE  = 0.2
const OPACITY_TEXT = 0.3
const RADIAN = Math.PI / 180

let containers = []

class PipesPieChart extends React.Component {
  state = { pinnedPipeline: undefined }

  containerRef = React.createRef()

  onMouseEnter = (data) => {
    if (this.state.pinnedPipeline) return
    this.props.onMouseEnter && this.props.onMouseEnter(data.name)
  }

  onMouseLeave = () => {
    if (this.state.pinnedPipeline) return
    this.props.onMouseLeave && this.props.onMouseLeave(this.props.activePipeline)
  }

  onMouseMove = (data) => {
    if (this.state.pinnedPipeline) return
    if (this.props.activePipeline !== data.name)
      this.props.onMouseEnter && this.props.onMouseEnter(data.name)
  }

  onClick = (data) => {
    this.setState(prevState => {
      const next = prevState.pinnedPipeline === data.name ? undefined : data.name
      if (!next) this.props.onMouseLeave && this.props.onMouseLeave(data.name)
      this.props.onPinChange && this.props.onPinChange(next)
      return { pinnedPipeline: next }
    })
  }

  onDocumentMouseMove = (ev) => {
    if (this.state.pinnedPipeline) return
    const { target } = ev
    const { props } = this
    const className = String((target.className !== undefined && target.className.baseVal) || target.className)
    if (props.activePipeline
      && !containers.some(c => c.contains(target))
      && !className.includes('recharts')
    ) {
      this.props.onMouseLeave && this.props.onMouseLeave(props.activePipeline)
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
      (this.previousData === undefined || this.previousData !== nextProps.data)
      || (this.activePipeline !== nextProps.activePipeline)
      || (this.state.pinnedPipeline !== nextState.pinnedPipeline)
    )
  }

  render() {
    const { data, colors, activePipeline } = this.props
    const { pinnedPipeline } = this.state
    const effectivePipeline = pinnedPipeline || activePipeline

    this.previousData = data
    this.activePipeline = activePipeline

    const topLabels = new Set(
      [...data].filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 6).map(d => d.name)
    )

    return (
      <div ref={this.containerRef}>
        <AutoSizer disableHeight>
          {({ width }) => {
            const total = data.reduce((s, d) => s + d.value, 0)
            const adjustedPositions = computeLabelPositions(data, width * 0.55, 175, 80,
              d => topLabels.has(d.name) && (total > 0 ? d.value / total >= 0.02 : false))
            return (
              <PieChart width={width} height={350} onMouseLeave={this.onMouseLeave}>
                <Pie
                  data={data}
                  cx='55%'
                  cy='50%'
                  dataKey='value'
                  innerRadius={40}
                  outerRadius={80}
                  label={props => renderLabel(props, effectivePipeline, topLabels, adjustedPositions)}
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
                      fill={effectivePipeline === undefined ? colors[entry.name] :
                        entry.name === effectivePipeline ? colors[entry.name] : hexToRGBA(colors[entry.name], OPACITY_PIE)
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
  const MIN_GAP = 20
  const MARGIN = 10
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

  const chartHeight = cyPx * 2
  const result = {}

  for (const isRight of [true, false]) {
    const side = labeled.filter(e => e.isRight === isRight)
    if (side.length === 0) continue
    side.sort((a, b) => a.naturalEy - b.naturalEy)

    const positions = side.map(e => e.naturalEy)

    // Forward pass: push each label down just enough to clear the previous one
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] < positions[i - 1] + MIN_GAP)
        positions[i] = positions[i - 1] + MIN_GAP
    }

    // Backward pass: if the last label overflows the bottom, pull everything up
    if (positions[positions.length - 1] > chartHeight - MARGIN) {
      positions[positions.length - 1] = chartHeight - MARGIN
      for (let i = positions.length - 2; i >= 0; i--) {
        if (positions[i] > positions[i + 1] - MIN_GAP)
          positions[i] = positions[i + 1] - MIN_GAP
      }
    }

    // Clamp the top into view
    if (positions[0] < MARGIN) {
      const shift = MARGIN - positions[0]
      for (let i = 0; i < positions.length; i++) positions[i] += shift
    }

    side.forEach((e, i) => { result[e.name] = positions[i] })
  }
  return result
}

function renderLabel(props, effectivePipeline, topLabels, adjustedPositions) {
  const { cx, cy, midAngle, outerRadius, startAngle, endAngle, fill, payload, percent } = props
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
  const rawName = !payload.name ? '(Empty)' : payload.name
  const name = rawName.length > 26 ? rawName.slice(0, 24) + '…' : rawName
  const textStyle = { fontWeight: payload.selected ? 'bold' : 'normal' }
  if (payload.name === 'null') textStyle.fontStyle = 'italic'
  const isActive = payload.name === effectivePipeline
  const someActive = effectivePipeline !== undefined
  if (percent < 0.02 && !isActive) return null
  if (!topLabels.has(payload.name) && !isActive) return null

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

export default PipesPieChart
