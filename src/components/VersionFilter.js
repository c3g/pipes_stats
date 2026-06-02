import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import MultiSelect from './MultiSelect'
import { setVersions } from '../actions'

class VersionFilter extends React.Component {

  onChange = (version, value) => {
    const values = { ...this.values }
    values[version] = value

    const selectedVersions =
      Object.entries(values)
        .filter(([v, checked]) => checked)
        .map(([v]) => v)

    this.props.setVersions(selectedVersions)
  }

  onChangeAll = (value) => {
    if (value)
      this.props.setVersions(Object.keys(this.values))
    else
      this.props.setVersions([])
  }

  render() {
    const { isLoading, params } = this.props
    const { versions } = params

    this.values = {}

    if (versions.all) {
      const { all } = versions
      const selected = versions.selected ? versions.selected : new Set(all)

      all.forEach(key => { this.values[key] = selected.has(key) })
    }

    return (
      <MultiSelect
        label='Version'
        className='MultiSelect--compact'
        loading={isLoading}
        values={this.values}
        onChange={this.onChange}
        onChangeAll={this.onChangeAll}
      />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.isLoading, uiState => uiState),
  params: createSelector(state => state.ui.params, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setVersions }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(VersionFilter)
