import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import Checkbox from './Checkbox'
import { setMerge } from '../actions'

function MergeCheckbox({ params, setMerge }) {
  return (
    <Checkbox checked={params.merge} onChange={() => setMerge(!params.merge)}>
      Merge Pipeline Versions
    </Checkbox>
  )
}


const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.isLoading, uiState => uiState),
  params: createSelector(state => state.ui.params, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setMerge }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MergeCheckbox)
