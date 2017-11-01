import React from 'react'
import pure from 'recompose/pure'
import { BootstrapTable as Table, TableHeaderColumn as Header } from 'react-bootstrap-table'

function PipesTable({ data }) {
  return (
    <Table data={data}>
      <Header dataSort dataField='name' isKey>Pipeline</Header>
      <Header dataSort dataField='samples'>Samples</Header>
      <Header dataSort dataField='submissions'>Submissions</Header>
      <Header dataSort dataField='average'>Average sample/submission</Header>
    </Table>
  )
}

export default pure(PipesTable)
