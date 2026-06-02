import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import classNames from 'classname'

import AutoSizer from './AutoSizer'
import hexToRGBA from '../utils/hexToRGBA'

export default class PipesLineChart extends React.Component {
  onMouseEnter = (name) => {
    if (this.props.activePipeline !== name)
      this.props.onMouseEnter && this.props.onMouseEnter(name)
  }

  onMouseLeave = (name) => {
    if (this.props.activePipeline === name)
      this.props.onMouseLeave && this.props.onMouseLeave(name)
  }

  onMouseMove = (name) => {
    if (this.props.activePipeline !== name)
      this.props.onMouseEnter && this.props.onMouseEnter(name)
  }

  render() {
    const { data, colors, activePipeline } = this.props
    const keys = data.length ? Object.keys(data[0]).filter(k => k !== 'month') : []

    const xInterval = Math.max(0, Math.ceil(data.length / 12) - 1)

    return (
      <AutoSizer disableHeight>
        {({ width }) =>
          <LineChart
            width={width}
            height={400}
            data={data}
            margin={{ top: 5, right: 5, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' interval={xInterval} />
            <YAxis
              label={{ value: 'Samples', angle: -90, position: 'left' }}
              type='number'
              domain={[0, 'dataMax || 1000']}
            />
            <Tooltip content={<ChartTooltip activePipeline={activePipeline} />} />
            {keys.map((key) => {
              const isActive = activePipeline === key
              return (
                <Line
                  type='linear'
                  key={key}
                  dataKey={key}
                  stroke={activePipeline === undefined ? colors[key] : isActive ? colors[key] : hexToRGBA(colors[key], 0.3)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={
                    <ActiveDot
                      activePipeline={activePipeline}
                      onMouseEnter={() => this.onMouseEnter(key)}
                      onMouseLeave={() => this.onMouseLeave(key)}
                    />
                  }
                  onMouseEnter={() => this.onMouseEnter(key)}
                  onMouseLeave={() => this.onMouseLeave(key)}
                  onMouseMove={() => this.onMouseMove(key)}
                />
              )
            })}
          </LineChart>
        }
      </AutoSizer>
    )
  }
}

const compareValue = (a, b) => b.value - a.value

function ChartTooltip(props) {
  const { active, activePipeline, payload, label } = props
  if (!activePipeline || !active) return null

  const items = (payload || []).filter(item => item.value !== 0).sort(compareValue)

  return (
    <div className='chart-popover'>
      <div className='label'>{monthToLabel(label)}</div>
      <div className='intro'>{monthToLabel(label)}</div>
      <div className='desc'>
        {items.length === 0 && <div className='empty'>No entries for this month</div>}
        <ul>
          {items.map(item => (
            <li key={item.name} className={'item ' + (item.name === activePipeline ? 'active' : '')}>
              <span className='color' style={{ backgroundColor: item.color }} />
              <span className='name'>{item.name}</span>
              <span className='value monospace'>{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function monthToLabel(month) {
  const date = new Date(month)
  return date.toLocaleString('en-US', { year: 'numeric', month: 'long' })
}

function ActiveDot({ cx, cy, r, className, fill, stroke, strokeWidth, onMouseEnter, onMouseLeave }) {
  const layerClass = classNames('recharts-dot', className)
  if (cx === +cx && cy === +cy && r === +r) {
    return (
      <circle
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        onMouseOver={onMouseEnter}
        onMouseOut={onMouseLeave}
        className={layerClass}
        cx={cx}
        cy={cy}
        r={r}
      />
    )
  }
  return null
}
