import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-bootstrap'

import DateRange from 'components/DateRange'
import MergeCheckbox from 'components/MergeCheckbox'
import PipelineFilter from 'components/PipelineFilter'
import PipesLineChart from 'components/PipesLineChart'
import PipesPieChart from 'components/PipesPieChart'
import PipesTable from 'components/PipesTable'

import { fetchData } from 'actions'

class AppContainer extends React.Component {
  render() {

    const { ui, stats } = this.props

    const lineChartData = generateLineChartData(stats.byPipeline)
    const samplesChartData = generatePieChartData(stats.byPipeline, 'samples')
    const submissionsChartData = generatePieChartData(stats.byPipeline, 'submissions')
    const tableData = generateTableData(stats.byPipeline)

    return (
      <Grid>
        <Row>
          <Col xs={12}>
            { ui.isLoading && 'Loading' }
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <DateRange />
          </Col>
          <Col xs={2}>
            <MergeCheckbox />
          </Col>
          <Col xs={4}>
            <PipelineFilter />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <PipesPieChart data={samplesChartData} />
          </Col>
          <Col xs={6}>
            <PipesPieChart data={submissionsChartData} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <PipesLineChart data={lineChartData} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <PipesTable data={tableData} />
          </Col>
        </Row>
      </Grid>
    )
  }
}


function generateLineChartData(byPipeline) {
  const pipelines = Object.keys(byPipeline)
  if (pipelines.length === 0)
    return []

  const data = byPipeline[pipelines[0]].months.map(stats => ({ month: stats.month }))

  pipelines.forEach(key => {
    const pipeline = byPipeline[key]
    pipeline.months.forEach((month, i) => {
      data[i][key] = month.samples
    })
  })

  return data
}

function generatePieChartData(byPipeline, property) {
  return Object.entries(byPipeline).map(([name, stats]) => ({
    name, value: stats[property]
  }))
}

function generateTableData(byPipeline) {
  return Object.entries(byPipeline).map(([name, stats]) => ({
    name, ...stats
  }))
}


const mapStateToProps = createStructuredSelector({
  stats: createSelector(state => state.stats, statsState => statsState),
  ui: createSelector(state => state.ui, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchData }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
