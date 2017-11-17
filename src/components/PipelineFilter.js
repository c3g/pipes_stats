import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import MultiSelect from './MultiSelect'
import { setPipelines } from '../actions'

class PipelineFilter extends React.Component {
  onChange = (pipeline, value) => {
    const values = { ...this.values }
    values[pipeline] = value

    const selectedPipelines = Object.entries(values)
      .filter(([pipeline, checked]) => checked)
      .map(([pipeline, checked]) => pipeline)

    this.props.setPipelines(selectedPipelines)
  }

  onChangeAll = value => {
    if (value) this.props.setPipelines(Object.keys(this.values))
    else this.props.setPipelines([])
  }

  render() {
    const { isLoading, params } = this.props
    const { pipelines } = params

    this.values = {}

    if (pipelines.all) {
      const all = [...pipelines.all].sort((a, b) => a.localeCompare(b))
      const selected = pipelines.selected ? pipelines.selected : new Set(all)

      all.forEach(key => (this.values[key] = selected.has(key)))
    }
    console.log(Object.keys(this.values).length)
    return (
      <MultiSelect loading={isLoading} values={this.values} onChange={this.onChange} onChangeAll={this.onChangeAll} />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.isLoading, uiState => uiState),
  params: createSelector(state => state.ui.params, uiState => uiState),
  byPipeline: createSelector(state => state.stats.byPipeline, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setPipelines }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PipelineFilter)
