import React from 'react'
import styled from 'styled-components'
import { PieChart, Pie, Cell, Sector, Tooltip } from 'recharts'

class PipesPieChart extends React.Component {
  state = {}

  onPieEnter = (data, index) => {
    debugger
    this.setState({ activeIndex: index })
  }

  shouldComponentUpdate() {
    return this.previousData !== this.props.data
  }

  render() {

    const { data, colors } = this.props
    const keys = data.length ? Object.keys(data[0]).filter(k => k !== 'month') : []

    /*activeIndex={this.state.activeIndex}
     *activeShape={renderActiveShape}
     *onMouseEnter={this.onPieEnter}*/

    if (this.previousData != data)
      this.previousData = data

    return (
      <PieChart width={540} height={300}>
        <Pie data={data}
          cx='50%'
          cy='50%'
          innerRadius={40}
          outerRadius={80}
          label={renderLabel}
          labelLine={false}
          isAnimationActive={true}
          onMouseEnter={this.onPieEnter}
        >
          {
            data.map((entry, i) =>
              <Cell fill={colors[entry.name]}/>)
          }
        </Pie>
        <Tooltip />
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
