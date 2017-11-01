import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import MultiSelect from 'components/MultiSelect'

import { setPipelines } from 'actions'

class PipelineFilter extends React.Component {
  state = {
    values: {},
  }

  componentWillReceiveProps(props) {
    if (props.byPipeline !== this.props.byPipeline) {
      const keys = Object.keys(props.byPipeline)
      const checked = props.params.pipelines ? new Set(props.params.pipelines) : new Set(keys)

      const values = {}
      keys.forEach(key => values[key] = checked.has(key))

      this.setState({ values: values })
    }
  }

  onChange = (pipeline, value) => {
    const values = { ...this.state.values }
    values[pipeline] = value

    this.props.setPipelines(
      Object.entries(values)
      .filter(([pipeline, checked]) => checked)
      .map(([pipeline, checked]) => pipeline)
    )
  }

  render() {
    const { values } = this.state

    return (
      <MultiSelect
        values={values}
        onChange={this.onChange}
      />
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
