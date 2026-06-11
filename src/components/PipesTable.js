import React, { useState } from 'react'
import { Table, OverlayTrigger, Popover } from 'react-bootstrap'

const PIPELINE_METADATA = {
  'Forge': {
    description: 'SickKids custom variant-calling pipeline used for the FORGE Canada rare disease genetics project (2016–2019).',
    url: 'https://genomecanada.ca/project/finding-rare-disease-genes-canada-forge-canada/',
  },
}

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

function PipelineName({ name }) {
  const meta = PIPELINE_METADATA[name]
  if (!meta) return name
  return (
    <span>
      {name}
      {' '}
      <OverlayTrigger
        trigger='click'
        placement='right'
        rootClose
        overlay={
          <Popover id={`popover-pipeline-${name}`}>
            <Popover.Body>
              {meta.description}{' '}
              <a href={meta.url} target='_blank' rel='noopener noreferrer'>Learn more</a>
            </Popover.Body>
          </Popover>
        }
      >
        <span className='pipeline-info-icon' role='button'>ⓘ</span>
      </OverlayTrigger>
    </span>
  )
}

function averageFormatter(cell) {
  return <span className='monospace'>{Math.round(cell)}</span>
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
          <SortHeader field='steps' current={sortField} dir={sortDir} onSort={handleSort} align='right' rowSpan={metricRowSpan}>Avg steps/submission</SortHeader>
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
            <td className='key'><PipelineName name={row.pipeline} /></td>
            {hasProtocols && <td className='key'>{row.protocol}</td>}
            {hasVersions && <td className='key'>{row.version}</td>}
            <td className='PipesTable__number text-end'>{row.samples}</td>
            <td className='PipesTable__number text-end'>{row.submissions}</td>
            <td className='PipesTable__number text-end'>{averageFormatter(row.average)}</td>
            <td className='PipesTable__number text-end'>{averageFormatter(row.steps / row.submissions)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default React.memo(PipesTable)
