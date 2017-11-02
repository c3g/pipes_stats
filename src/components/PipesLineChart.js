import React from 'react'
import styled from 'styled-components'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

import hexToRGBA from 'utils/hexToRGBA'

const PopoverList = styled.ul`
  list-style: none;
  padding: 0;
  column-count: 3;
  column-width: 200px;
`

function PipesLineChart({
    data,
    colors,
    activePipeline
  }) {

  const keys = data.length ? Object.keys(data[0]).filter(k => k !== 'month') : []

  return (
    <LineChart
        width={1000}
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

          return <Line
            type='linear'
            key={key}
            dataKey={key}
            stroke={ (activePipeline === undefined) ? colors[key] :
                                           isActive ? colors[key] : hexToRGBA(colors[key], 0.3)
            }
            strokeWidth={isActive ? 2 : 1}
            dot={false}
          />
        })
      }
    </LineChart>
  )
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

export default PipesLineChart
