import React from 'react'
import pure from 'recompose/pure'
import { BootstrapTable as Table, TableHeaderColumn as Header } from 'react-bootstrap-table'

function PipesTable({ data }) {
  const options = {
    defaultSortName: 'samples',
    defaultSortOrder: 'desc',
  }
  return (
    <Table className='PipesTable' tableHeaderClass='PipesTable__header' data={data} options={options}>
      <Header dataSort dataField='name' isKey columnClassName='key'>Pipeline</Header>
      <Header
        dataSort
        dataAlign='right'
        dataField='samples'
        columnClassName='PipesTable__number'
      >
        Samples
      </Header>
      <Header
        dataSort
        dataAlign='right'
        dataField='submissions'
        columnClassName='PipesTable__number'
      >
        Submissions
      </Header>
      <Header
        dataSort
        dataAlign='right'
        dataField='average'
        dataFormat={averageFormatter}
        columnClassName='PipesTable__number'
      >
        Average sample/submission
      </Header>
    </Table>
  )
}

const PRECISION = 3
const FACTOR = 10 ** PRECISION

function averageFormatter(cell, row) {
  const number = Math.round(cell * FACTOR) / FACTOR
  const value = number.toString()
  const parts = value.split('.')

  const notDecimals = parts[0]
  const decimals = parts[1] ? '.' + parts[1] : ''
  const chars = decimals.split('')
  while(chars.length < (PRECISION + 1))
    chars.push(<span>&nbsp;</span>)

  return (
    <span>
      {notDecimals}{chars}
    </span>
  )
}

export default pure(PipesTable)
