import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { getPresentationAttributes } from 'recharts/lib/util/ReactUtils.js'
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

    return (
      <AutoSizer disableHeight>
      {
        ({ width }) =>
          <LineChart
              width={width}
              height={400}
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>

            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' tickCounts={1} />
            <YAxis type='number' domain={[0, 'dataMax || 1000']}/>
            <Legend content={renderLegend} />
            <Tooltip content={<ChartTooltip activePipeline={activePipeline} />}/>
            {
              keys.map((key, i) => {

                const isActive = activePipeline === key

                const onMouseEnter = () => this.onMouseEnter(key)
                const onMouseLeave = () => this.onMouseLeave(key)
                const onMouseMove  = () => this.onMouseMove(key)

                return (
                  <Line
                    type='linear'
                    key={key}
                    dataKey={key}
                    stroke={ (activePipeline === undefined) ? colors[key] :
                                                  isActive ? colors[key] : hexToRGBA(colors[key], 0.3)
                    }
                    strokeWidth={isActive ? 2 : 2}
                    dot={false}
                    activeDot={
                      <ActiveDot activePipeline={activePipeline}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                      />
                    }
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onMouseMove={onMouseMove}
                  />
                )
              })
            }
          </LineChart>
      }
      </AutoSizer> 
    )
  }
}

function renderLegend(props) {
  const { payload } = props

  return (
    <div style={{ color: '#888' }}>
      Months
    </div>
  )
}


const compareValue = (a, b) => b.value - a.value

const ChartTooltip  = (props) => {
  const { active, activePipeline } = props;

  if (active) {
    const { payload, label } = props;

    const items = payload.filter(item => item.value !== 0).sort(compareValue)

    return (
      <div className='chart-popover'>
        <div className='label'>{monthToLabel(label)}</div>
        <div className='intro'>{monthToLabel(label)}</div>
        <div className='desc'>
          {
            items.length === 0 &&
              <div className='empty'>No entries for this month</div>
          }
          <ul>
            {
              items.map(item =>
                <li className={ 'item ' + (item.name === activePipeline ? 'active' : '') }>
                  <span className='color' style={{ backgroundColor: item.color }}/>
                  <span className='name'>{ item.name }</span>
                  <span className='value monospace'>{ item.value }</span>
                </li>
              )
            }
          </ul>
        </div>
      </div>
    )
  }

  return null
}

/** @param {string} date - format: yyyy-mm */
function monthToLabel(month) {
  const date = new Date(month)
  return date.toLocaleString('en-US', { year: 'numeric', month: 'long' })
}

const ActiveDot = (props) => {
  const { cx, cy, r, className, dataKey, activePipeline } = props
  const layerClass = classNames('recharts-dot', className)

  if (cx === +cx && cy === +cy && r === +r) {

    return (
      <circle
        {...getPresentationAttributes(props)}
        onMouseOver={props.onMouseEnter}
        onMouseOut={props.onMouseLeave}
        className={layerClass}
        cx={cx}
        cy={cy}
        r={r}
      />
    )
  }

  return null
}
