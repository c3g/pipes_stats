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

    const xAxisProps = getXAxisProps(data)

    return (
      <AutoSizer disableHeight>
        {({ width }) =>
          <LineChart
            width={width}
            height={400}
            data={data}
            margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' {...xAxisProps} />
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
      <div className='label'>{periodToLabel(label)}</div>
      <div className='intro'>{periodToLabel(label)}</div>
      <div className='desc'>
        {items.length === 0 && <div className='empty'>No entries for this period</div>}
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

function parseMonthKey(key) {
  const [year, month] = key.split('-')
  return new Date(Number(year), Number(month) - 1, 1)
}

function isWeekKey(key) {
  return /^\d{4}-W\d{2}$/.test(key)
}

function isoWeekToDate(weekKey) {
  const [yearStr, weekStr] = weekKey.split('-W')
  const year = Number(yearStr)
  const week = Number(weekStr)
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7  // Mon=1 … Sun=7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
  return monday
}

function getXAxisProps(data) {
  if (data.length === 0) return { interval: 0 }
  const n = data.length

  if (isWeekKey(data[0].month)) {
    // Week mode: at most ~13 weeks; show every week or every other week
    return {
      interval: n > 13 ? 1 : 0,
      tickFormatter: weekKey => {
        const d = isoWeekToDate(weekKey)
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric' })
      },
    }
  }

  if (n <= 13) {
    // Every month, "Jan 2026"
    return {
      interval: 0,
      tickFormatter: month => parseMonthKey(month).toLocaleString('en-US', { month: 'short', year: '2-digit' }),
    }
  }

  if (n <= 36) {
    // Every 2–3 months, "Jan '26"
    const interval = Math.ceil(n / 12) - 1
    return {
      interval,
      tickFormatter: month => parseMonthKey(month).toLocaleString('en-US', { month: 'short', year: '2-digit' }),
    }
  }

  // Long range: only January of each year, "2026"
  const januaryTicks = data.map(d => d.month).filter(m => parseMonthKey(m).getMonth() === 0)
  return {
    ticks: januaryTicks,
    tickFormatter: month => String(parseMonthKey(month).getFullYear()),
  }
}

function periodToLabel(key) {
  if (isWeekKey(key)) {
    const start = isoWeekToDate(key)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const fmt = { month: 'long', day: 'numeric' }
    return `${start.toLocaleString('en-US', fmt)} – ${end.toLocaleString('en-US', fmt)}`
  }
  return parseMonthKey(key).toLocaleString('en-US', { year: 'numeric', month: 'long' })
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
