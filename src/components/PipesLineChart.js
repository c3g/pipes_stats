import React from 'react'
import styled from 'styled-components'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

import AutoSizer from 'components/AutoSizer'
import hexToRGBA from 'utils/hexToRGBA'

const PopoverList = styled.ul`
  list-style: none;
  padding: 0;
  column-count: 3;
  column-width: 200px;
`

export default class PipesLineChart extends React.Component {
  onMouseEnter = (name) => {
    this.props.onMouseEnter && this.props.onMouseEnter(name)
  }

  onMouseLeave = (name) => {
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
            <Tooltip />
            {
              keys.map((key, i) => {

                const isActive = activePipeline === key

                return (
                  <Line
                    type='linear'
                    key={key}
                    dataKey={key}
                    stroke={ (activePipeline === undefined) ? colors[key] :
                                                  isActive ? colors[key] : hexToRGBA(colors[key], 0.3)
                    }
                    strokeWidth={isActive ? 2 : 1}
                    dot={false}
                    onMouseEnter={() => this.onMouseEnter(key)}
                    onMouseLeave={() => this.onMouseLeave(key)}
                    onMouseMove={() => this.onMouseMove(key)}
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

function ChartTooltip(props) {
  const { active, payload, label, coordinate } = props

  if (!active || !payload)
    return null

  console.log(props)
  return (
    <div className='popover fade in right chart-popover'
        style={{ transform: `translate(${coordinate.x}, ${coordinate.y})` }}>
      <div className='popover-title'>{ label }</div>
      <div className='popover-content'>
        <PopoverList>
          {
            payload.map(item =>
              <li>
                <span className='square' style={{ backgroundColor: item.color }}/>
                { `${item.name} (${item.value})` }
              </li>
            )
          }
        </PopoverList>
      </div>
    </div>
  )
}

