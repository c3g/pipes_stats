import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import MultiSelect from './MultiSelect'
import { setProtocols } from '../actions'

class ProtocolFilter extends React.Component {

  onChange = (protocol, value) => {
    const values = { ...this.values }
    values[protocol] = value

    const selectedProtocols =
      Object.entries(values)
        .filter(([p, checked]) => checked)
        .map(([p]) => p)

    this.props.setProtocols(selectedProtocols)
  }

  onChangeAll = (value) => {
    if (value)
      this.props.setProtocols(Object.keys(this.values))
    else
      this.props.setProtocols([])
  }

  render() {
    const { isLoading, params } = this.props
    const { protocols } = params

    this.values = {}

    if (protocols.all) {
      const { all } = protocols
      const selected = protocols.selected ? protocols.selected : new Set(all)

      all.forEach(key => { this.values[key] = selected.has(key) })
    }

    return (
      <MultiSelect
        label='Protocol'
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
  return bindActionCreators({ setProtocols }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProtocolFilter)
