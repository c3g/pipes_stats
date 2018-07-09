import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  Grid,
  Row,
  Col,
  Navbar,
} from 'react-bootstrap'
import cx from 'classname'
import { DateFrom, DateTo } from '../components/DateRange'
import MergeCheckbox from '../components/MergeCheckbox'
import PipelineFilter from '../components/PipelineFilter'
import PipesLineChart from '../components/PipesLineChart'
import PipesPieChart from '../components/PipesPieChart'
import PipesTable from '../components/PipesTable'

import weakMapMemoize from '../utils/weakMapMemoize'
import { fetchData, setActivePipeline, removeActivePipeline, printPDF } from '../actions'

class AppContainer extends React.Component {
  componentDidMount() {
    document.body.className = ''
    document.body.addEventListener('keydown', this.onDocumentKeyDown)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.onDocumentKeyDown)
  }

  onDocumentKeyDown = ev => {
    if (ev.ctrlKey && ev.key === 'p') {
      ev.preventDefault()
      printPDF()
    }
  }

  render() {

    const { ui, stats } = this.props
    const { params, activePipeline } = ui
    const { selected } = params.pipelines
    const { byPipeline } = stats


    const samplesChartData = generatePieChartData(byPipeline, 'samples', selected)
    const submissionsChartData = generatePieChartData(byPipeline, 'submissions', selected)
    const lineChartData = generateLineChartData(byPipeline, selected)
    const tableData = generateTableData(byPipeline, selected)

    const colorMap = generateColorMap(byPipeline)

    return (
      <div className='App'>

        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <a className='App-title' href='https://bitbucket.org/mugqic/genpipes'>
                GenPipes
              </a>
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullLeft>
              <DateFrom />
            </Navbar.Form>
            <Navbar.Form pullLeft>
              <DateTo />
            </Navbar.Form>
            <Navbar.Form pullLeft>
              <PipelineFilter />
            </Navbar.Form>
            <Navbar.Form pullLeft>
              <MergeCheckbox />
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>

        <Grid className='App-content'>
          <div className='App-inner'>

            <Row className={cx({ 'is-loading': ui.isLoading })}>
              <Col xs={6}>
                <h4>By Samples</h4>
                <PipesPieChart
                  data={samplesChartData}
                  colors={colorMap}
                  activePipeline={activePipeline}
                  onMouseEnter={this.props.setActivePipeline}
                  onMouseLeave={this.props.removeActivePipeline}
                />
              </Col>
              <Col xs={6}>
                <h4>By Submissions</h4>
                <PipesPieChart
                  data={submissionsChartData}
                  colors={colorMap}
                  activePipeline={activePipeline}
                  onMouseEnter={this.props.setActivePipeline}
                  onMouseLeave={this.props.removeActivePipeline}
                />
              </Col>
            </Row>

            <Row className={cx({ 'is-loading': ui.isLoading })}>
              <Col xs={12}>
                <PipesLineChart
                  data={lineChartData}
                  colors={colorMap}
                  activePipeline={activePipeline}
                  onMouseEnter={this.props.setActivePipeline}
                  onMouseLeave={this.props.removeActivePipeline}
                />
              </Col>
            </Row>

            <Row className={cx({ 'is-loading': ui.isLoading })}>
              <Col xs={12}>
                <PipesTable data={tableData} />
              </Col>
            </Row>
          </div>
        </Grid>
      </div>
    )
  }
}

const generateColorMap = weakMapMemoize((byPipeline) => {
  const colorMap = {}
  Object.entries(byPipeline).forEach(([pipeline, data]) => {
    colorMap[pipeline] = data.color
  })
  return colorMap
})

const generateLineChartData = weakMapMemoize((byPipeline, selected) => {
  const pipelines = Object.keys(byPipeline)
  if (pipelines.length === 0)
    return []

  const data = byPipeline[pipelines[0]].months.map(stats => ({ month: stats.month }))

  pipelines.forEach(key => {
    const pipeline = byPipeline[key]
    const isSelected = selected.has(key)
    pipeline.months.forEach((month, i) => {
      data[i][key] = isSelected ? month.samples : 0
    })
  })

  return data
})

const generatePieChartData = weakMapMemoize([WeakMap, Map, WeakMap], (byPipeline, property, selected) => {
  return Object.entries(byPipeline).map(([name, stats]) => ({
    name, value: selected.has(name) ? stats[property] : 0
  }))
})

const generateTableData = weakMapMemoize((byPipeline, selected) => {
  return Object.entries(byPipeline)
    .filter(([name, stats]) => selected.has(name))
    .map(([name, stats]) => ({ name, ...stats }))
})



const mapStateToProps = createStructuredSelector({
  stats: createSelector(state => state.stats, statsState => statsState),
  ui: createSelector(state => state.ui, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchData, setActivePipeline, removeActivePipeline }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
