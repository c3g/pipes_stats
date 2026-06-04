import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Checkbox from './Checkbox'
import { setMergeProtocol } from '../actions'

function MergeProtocolCheckbox({ params, setMergeProtocol: onMergeProtocol }) {
  return (
    <Checkbox checked={params.mergeProtocol} onChange={() => onMergeProtocol(!params.mergeProtocol)}>
      Merge Pipeline Protocols
    </Checkbox>
  )
}

const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.isLoading, uiState => uiState),
  params: createSelector(state => state.ui.params, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setMergeProtocol }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeProtocolCheckbox)
