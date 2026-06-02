import React, { useState } from 'react'
import { Table } from 'react-bootstrap'

const VERSION_RE = /-(\d+\.\d+.*)$/
const PROTOCOL_RE = /\.([^-]+)/

function splitName(name) {
  const vMatch = name.match(VERSION_RE)
  const version = vMatch ? vMatch[1] : ''
  const base = vMatch ? name.slice(0, vMatch.index) : name
  const pMatch = base.match(PROTOCOL_RE)
  const protocol = pMatch ? pMatch[1] : ''
  const pipeline = pMatch ? base.slice(0, pMatch.index) : base
  return { pipeline, protocol, version }
}

function averageFormatter(cell) {
  return <span className='monospace'>{cell.toFixed(2)}</span>
}

function SortHeader({ field, current, dir, onSort, align, rowSpan, colSpan, children }) {
  const isActive = field === current
  const arrow = isActive ? (dir === 'asc' ? ' ▲' : ' ▼') : ''
  return (
    <th
      onClick={() => onSort(field)}
      rowSpan={rowSpan}
      colSpan={colSpan}
      style={{ cursor: 'pointer', textAlign: align || 'left', userSelect: 'none' }}
      className={isActive ? 'table-active' : ''}
    >
      {children}{arrow}
    </th>
  )
}

function PipesTable({ data, hasVersions, hasProtocols }) {
  const [sortField, setSortField] = useState('samples')
  const [sortDir, setSortDir] = useState('desc')

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const rows = data.map(row => ({ ...row, ...splitName(row.name) }))

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
    return sortDir === 'asc' ? cmp : -cmp
  })

  const subColumns = hasProtocols || hasVersions
  const pipelineColSpan = 1 + (hasProtocols ? 1 : 0) + (hasVersions ? 1 : 0)
  const metricRowSpan = subColumns ? 2 : 1

  return (
    <Table className='PipesTable' bordered hover>
      <thead className='PipesTable__header'>
        <tr>
          {subColumns
            ? <th colSpan={pipelineColSpan} style={{ textAlign: 'center' }}>Pipeline</th>
            : <SortHeader field='pipeline' current={sortField} dir={sortDir} onSort={handleSort}>Pipeline</SortHeader>
          }
          <SortHeader field='samples' current={sortField} dir={sortDir} onSort={handleSort} align='right' rowSpan={metricRowSpan}>Samples</SortHeader>
          <SortHeader field='submissions' current={sortField} dir={sortDir} onSort={handleSort} align='right' rowSpan={metricRowSpan}>Submissions</SortHeader>
          <SortHeader field='average' current={sortField} dir={sortDir} onSort={handleSort} align='right' rowSpan={metricRowSpan}>Avg samples/submission</SortHeader>
        </tr>
        {subColumns && (
          <tr>
            <SortHeader field='pipeline' current={sortField} dir={sortDir} onSort={handleSort}>Name</SortHeader>
            {hasProtocols && <SortHeader field='protocol' current={sortField} dir={sortDir} onSort={handleSort}>Protocol</SortHeader>}
            {hasVersions && <SortHeader field='version' current={sortField} dir={sortDir} onSort={handleSort}>Version</SortHeader>}
          </tr>
        )}
      </thead>
      <tbody>
        {sorted.map(row => (
          <tr key={row.name}>
            <td className='key'>{row.pipeline}</td>
            {hasProtocols && <td className='key'>{row.protocol}</td>}
            {hasVersions && <td className='key'>{row.version}</td>}
            <td className='PipesTable__number text-end'>{row.samples}</td>
            <td className='PipesTable__number text-end'>{row.submissions}</td>
            <td className='PipesTable__number text-end'>{averageFormatter(row.average)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default React.memo(PipesTable)
