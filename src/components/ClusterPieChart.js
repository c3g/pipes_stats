import React from 'react'
import { PieChart, Pie, Cell, Sector, Tooltip } from 'recharts'

import AutoSizer from './AutoSizer'
import COLORS from '../constants/colors'
import hexToRGBA from '../utils/hexToRGBA'

const OPACITY_PIE  = 0.5
const OPACITY_TEXT = 0.3

let containers = []

class ClusterPieChart extends React.Component {
  state = {
    activeCluster: undefined,
  }

  onMouseEnter = (data, index) => {
    this.setState({ activeCluster: data.name })
  }

  onMouseLeave = (data, index) => {
    this.setState({ activeCluster: undefined })
  }

  onMouseMove = (data, index) => {
    if (this.state.activeCluster !== data.name)
      this.setState({ activeCluster: data.name })
  }

  onDocumentMouseMove = (ev) => {
    const { target } = ev
    const { state, chart } = this

    const className = String((target.className !== undefined && target.className.baseVal) || target.className)

    // XXX: we're using recharts internal .container here
    if (this.state.activeCluster
      && !containers.some(c => c.contains(target))
      && !className.includes('recharts')
    ) {
      this.setState({ activeCluster: undefined })
    }
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onDocumentMouseMove)
    this.container = this.chart.container
    if (this.container)
      containers.push(this.container)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onDocumentMouseMove)
    containers = containers.filter(c => c !== this.container)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.previousData.length === 0
      || this.previousData !== nextProps.data
      || this.state.activeCluster !== nextState.activeCluster
    )
  }

  render() {

    const { data } = this.props
    const { activeCluster } = this.state

    const activeIndex = data.findIndex(d => d.name === activeCluster)

    if (this.previousData != data)
      this.previousData = data

    return (
      <AutoSizer disableHeight>
      {
        ({ width }) =>
          <PieChart width={width} height={300} ref={r => this.chart = r}>
            <Pie data={data}
              cx='50%'
              cy='50%'
              dataKey='value'
              innerRadius={40}
              outerRadius={80}
              label={props => renderLabel(props, activeCluster)}
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
                  <Cell fill={
                    activeCluster === undefined ?
                      COLORS[i % COLORS.length] :
                    entry.name === activeCluster ?
                      COLORS[i % COLORS.length] :
                      hexToRGBA(COLORS[i % COLORS.length], OPACITY_PIE)
                  }/>
                )
              }
            </Pie>
          </PieChart>
      }
      </AutoSizer>
    )
  }
}

function renderLabel(props, activeCluster) {
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

  const name = !payload.name ? '(Empty)' : payload.name

  const textStyle = { fontWeight: payload.selected ? 'bold' : 'normal' }
  if (payload.name === 'null')
    textStyle.fontStyle = 'italic'

  const angle = endAngle - startAngle

  const isActive = payload.name === activeCluster
  const someActive = activeCluster !== undefined

  if (angle < 7 && !isActive)
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
        fill={ `rgba(51, 51, 51, ${ isActive ? 1 : someActive ? OPACITY_TEXT : 1 })` }
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

export default ClusterPieChart
