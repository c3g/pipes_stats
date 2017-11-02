import React from 'react'
import styled from 'styled-components'
import { PieChart, Pie, Cell, Sector, Tooltip } from 'recharts'

import hexToRGBA from 'utils/hexToRGBA'

let containers = []

class PipesPieChart extends React.Component {
  state = {}

  onMouseEnter = (data, index) => {
    this.props.onMouseEnter && this.props.onMouseEnter(data.name)
  }

  onMouseLeave = (data, index) => {
    this.props.onMouseLeave && this.props.onMouseLeave(data.name)
  }

  onMouseMove = (data, index) => {
    if (this.props.activePipeline !== data.name)
      this.props.onMouseEnter && this.props.onMouseEnter(data.name)
  }

  onDocumentMouseMove = (ev) => {
    const { target } = ev
    const { props, chart } = this
    // XXX: we're using recharts internal .container here
    if (props.activePipeline
      && !containers.some(c => c.contains(target))
      && target.className !== 'recharts-sector'
      && target.className.baseVal !== 'recharts-sector'
    ) {
      this.props.onMouseLeave && this.props.onMouseLeave(props.activePipeline)
    }
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onDocumentMouseMove)
    this.container = this.chart.container
    containers.push(this.container)
  }

  componentDidUnmount() {
    document.removeEventListener('mousemove', this.onDocumentMouseMove)
    containers.filter(c => c === this.container)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const shouldUpdate = ((this.previousData.length === 0 || this.previousData !== nextProps.data)
        || (this.activePipeline !== nextProps.activePipeline))

    console.log(shouldUpdate, { previous: this.activePipeline, new: nextProps.activePipeline })

    return shouldUpdate
  }

  render() {

    const { data, colors, activePipeline } = this.props
    const keys = data.length ? Object.keys(data[0]).filter(k => k !== 'month') : []

    const activeIndex = data.findIndex(d => d.name === activePipeline)

    if (this.previousData != data)
      this.previousData = data

    if (this.activePipeline != activePipeline)
      this.activePipeline = activePipeline

    return (
      <PieChart width={540} height={300} ref={r => this.chart = r}>
        <Pie data={data}
          cx='50%'
          cy='50%'
          dataKey='value'
          innerRadius={40}
          outerRadius={80}
          label={renderLabel}
          labelLine={false}
          isAnimationActive={true}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
        >
          {
            data.map((entry, i) =>
              <Cell fill={activePipeline === undefined ? colors[entry.name] :
                         entry.name === activePipeline ? colors[entry.name] : hexToRGBA(colors[entry.name], 0.5)
              }/>
            )
          }
        </Pie>
      </PieChart>
    )
  }
}

function renderLabel(props) {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius +  0) * cos;
  const sy = cy + (outerRadius +  0) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 25;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  const name = payload.name === '' ? '(Empty)' : payload.name

  const textStyle = { fontWeight: payload.selected ? 'bold' : 'normal' }
  if (payload.name === 'null')
    textStyle.fontStyle = 'italic'

  const angle = endAngle - startAngle

  if (angle < 7)
    return null

  return (
    <g>

      { payload.selected &&
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      }

      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill='none'/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke='none'/>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 3}
        textAnchor={textAnchor}
        fill='#333'
        style={textStyle}
      >
        { name } {`(${ payload.value })`}
      </text>
    </g>
  )
}

function renderActiveShape(props) {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius +  0) * cos;
  const sy = cy + (outerRadius +  0) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 25;
  const ey = my;

  return (
    <g>

      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  )
}

export default PipesPieChart
