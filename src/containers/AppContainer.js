import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Row, Col, Navbar } from 'react-bootstrap'
import cx from 'classname'
import ClusterPieChart from '../components/ClusterPieChart'
import { DateFrom, DateTo } from '../components/DateRange'
import MergeCheckbox from '../components/MergeCheckbox'
import MergeProtocolCheckbox from '../components/MergeProtocolCheckbox'
import PipelineFilter from '../components/PipelineFilter'
import VersionFilter from '../components/VersionFilter'
import ProtocolFilter from '../components/ProtocolFilter'
import PipesLineChart from '../components/PipesLineChart'
import PipesPieChart from '../components/PipesPieChart'
import PipesTable from '../components/PipesTable'

import weakMapMemoize from '../utils/weakMapMemoize'
import { fetchData, setActivePipeline, removeActivePipeline, setCluster, printPDF } from '../actions'

class AppContainer extends React.Component {
  state = { pinnedPipeline: undefined }

  onPinPipeline = (name) => {
    this.setState({ pinnedPipeline: name })
  }

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
    const { byPipeline, submissionsByCluster, uniqueUsersByCluster } = stats
    const { pinnedPipeline } = this.state

    const hasVersions = params.versions.all && params.versions.all.length > 0
    const hasProtocols = params.protocols.all && params.protocols.all.length > 0
    const effectiveSelected = (hasVersions || hasProtocols)
      ? computeEffectiveSelected(selected, params.versions.selected, params.protocols.selected)
      : selected

    const effectiveByPipeline = (hasProtocols && params.mergeProtocol)
      ? aggregateByProtocol(byPipeline)
      : byPipeline
    const activeSelected = (hasProtocols && params.mergeProtocol)
      ? new Set([...effectiveSelected].map(removeProtocol))
      : effectiveSelected

    // Pie chart always aggregates by version: old ingested data embeds version in the
    // pipeline name itself, so we strip it regardless of the merge-versions toggle.
    const pieByPipeline = aggregateByVersion(effectiveByPipeline)
    const pieActiveSelected = new Set([...activeSelected].map(removeVersion))

    // pinnedPipeline from pie click may be a version-stripped key; expand it back
    // to all matching versioned entries for the line chart and table.
    const pinnedSelected = pinnedPipeline
      ? (activeSelected.has(pinnedPipeline)
        ? new Set([pinnedPipeline])
        : new Set([...activeSelected].filter(k => removeVersion(k) === pinnedPipeline)))
      : activeSelected

    const clusterSource = pinnedPipeline && pieByPipeline[pinnedPipeline]?.clusterBreakdown
      ? pieByPipeline[pinnedPipeline].clusterBreakdown
      : submissionsByCluster

    const pieColorMap = generateColorMap(pieByPipeline)
    const colorMap = generateColorMap(effectiveByPipeline)

    const samplesChartData = generatePieChartData(pieByPipeline, 'samples', pieActiveSelected)
    const usersSource = pinnedPipeline ? EMPTY_OBJ : uniqueUsersByCluster
    const submissionsChartData = generateClusterPieChartData(clusterSource, usersSource)
    const lineChartData = generateLineChartData(effectiveByPipeline, pinnedSelected)
    const tableData = generateTableData(effectiveByPipeline, pinnedSelected)

    return (
      <div className='App'>

        <Navbar expand="lg" className="bg-light border-bottom py-1 px-3">
          <Navbar.Brand
            href='https://github.com/c3g/GenPipes'
            className='App-title me-3'
          >
            <img src='/genpipes_logo.png' alt='GenPipes' height='28' style={{ objectFit: 'contain' }} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-filters" />
          <Navbar.Collapse id="navbar-filters">
            <div className="d-flex flex-wrap align-items-center gap-2 py-1">
              <DateFrom />
              <DateTo />
              {(hasVersions || params.merge) && <MergeCheckbox />}
              {(hasProtocols || params.mergeProtocol) && <MergeProtocolCheckbox />}
              <PipelineFilter />
              {hasVersions && <VersionFilter />}
              {hasProtocols && <ProtocolFilter />}
            </div>
          </Navbar.Collapse>
        </Navbar>

        <Container fluid className='App-content'>
          <div className='App-inner'>

            <Row className={cx({ 'is-loading': ui.isLoading })}>
              <Col xs={6}>
                <h4>Samples by Pipeline</h4>
                <PipesPieChart
                  data={samplesChartData}
                  colors={pieColorMap}
                  activePipeline={activePipeline}
                  onMouseEnter={this.props.setActivePipeline}
                  onMouseLeave={this.props.removeActivePipeline}
                  onPinChange={this.onPinPipeline}
                />
              </Col>
              <Col xs={6}>
                <h4>Submissions by Cluster</h4>
                <ClusterPieChart
                  data={submissionsChartData}
                  onPinChange={this.props.setCluster}
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
                <PipesTable data={tableData} hasVersions={hasVersions} hasProtocols={hasProtocols} />
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    )
  }
}

function extractVersion(key) {
  const match = key.match(/-(\d+\.\d+.*)$/)
  return match ? match[1] : null
}

function removeVersion(key) {
  return key.replace(/-(\d+\.\d+.*)$/, '')
}

function extractProtocol(key) {
  const base = key.replace(/-(\d+\.\d+.*)$/, '')
  const match = base.match(/\.([^.]+)$/)
  return match ? match[1] : null
}

function removeProtocol(key) {
  const vMatch = key.match(/-(\d+\.\d+.*)$/)
  const versionSuffix = vMatch ? vMatch[0] : ''
  const base = vMatch ? key.slice(0, vMatch.index) : key
  const dotIdx = base.indexOf('.')
  return (dotIdx !== -1 ? base.slice(0, dotIdx) : base) + versionSuffix
}

const computeEffectiveSelected = weakMapMemoize((pipelinesSelected, versionsSelected, protocolsSelected) => {
  const result = new Set()
  pipelinesSelected.forEach(key => {
    const version = extractVersion(key)
    const protocol = extractProtocol(key)
    if ((!version || versionsSelected.has(version)) && (!protocol || protocolsSelected.has(protocol)))
      result.add(key)
  })
  return result
})

const aggregateByVersion = weakMapMemoize((byPipeline) => {
  const result = {}
  Object.entries(byPipeline).forEach(([key, data]) => {
    const mergedKey = removeVersion(key)
    if (!result[mergedKey]) {
      result[mergedKey] = {
        ...data,
        months: data.months.map(m => ({ ...m })),
        clusterBreakdown: { ...(data.clusterBreakdown || {}) },
      }
    } else {
      const existing = result[mergedKey]
      existing.samples += data.samples
      existing.submissions += data.submissions
      existing.steps += data.steps
      existing.average = Math.round(existing.samples / existing.submissions)
      data.months.forEach((m, i) => {
        if (existing.months[i]) existing.months[i] = { ...existing.months[i], samples: existing.months[i].samples + m.samples }
      })
      Object.entries(data.clusterBreakdown || {}).forEach(([cluster, count]) => {
        existing.clusterBreakdown[cluster] = (existing.clusterBreakdown[cluster] || 0) + count
      })
    }
  })
  return result
})

const aggregateByProtocol = weakMapMemoize((byPipeline) => {
  const result = {}
  Object.entries(byPipeline).forEach(([key, data]) => {
    const mergedKey = removeProtocol(key)
    if (!result[mergedKey]) {
      result[mergedKey] = {
        ...data,
        months: data.months.map(m => ({ ...m })),
        clusterBreakdown: { ...(data.clusterBreakdown || {}) },
      }
    } else {
      const existing = result[mergedKey]
      existing.samples += data.samples
      existing.submissions += data.submissions
      existing.steps += data.steps
      existing.average = Math.round(existing.samples / existing.submissions)
      data.months.forEach((m, i) => {
        if (existing.months[i]) existing.months[i] = { ...existing.months[i], samples: existing.months[i].samples + m.samples }
      })
      Object.entries(data.clusterBreakdown || {}).forEach(([cluster, count]) => {
        existing.clusterBreakdown[cluster] = (existing.clusterBreakdown[cluster] || 0) + count
      })
    }
  })
  return result
})

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

const generatePieChartData = weakMapMemoize([WeakMap, Map, WeakMap], (byPipeline, property, selected) =>
  Object.entries(byPipeline).map(([name, stats]) => ({
    name, value: selected.has(name) ? stats[property] : 0
  }))
)

const EMPTY_OBJ = {}

const generateClusterPieChartData = weakMapMemoize((submissionsByCluster, uniqueUsersByCluster) =>
  Object.entries(submissionsByCluster).map(([name, value]) => ({
    name,
    value,
    users: uniqueUsersByCluster[name] ?? 0,
  }))
)

const generateTableData = weakMapMemoize((byPipeline, selected) =>
  Object.entries(byPipeline)
    .filter(([name]) => selected.has(name))
    .map(([name, stats]) => ({ name, ...stats }))
)

const mapStateToProps = createStructuredSelector({
  stats: createSelector(state => state.stats, statsState => statsState),
  ui: createSelector(state => state.ui, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchData, setActivePipeline, removeActivePipeline, setCluster }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
