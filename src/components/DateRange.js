import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { InputGroup } from 'react-bootstrap'
import DatePicker from './DatePicker'

import { setDateFrom, setDateTo } from '../actions'

const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.isLoading, uiState => uiState),
  params: createSelector(state => state.ui.params, uiState => uiState),
})

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ setDateFrom, setDateTo }, dispatch)

const bind = connect(mapStateToProps, mapDispatchToProps)

export const DateFrom = bind(({ params, setDateFrom: onDateFrom }) =>
  <DatePicker
    onChange={onDateFrom}
    placeholder='YYYY-MM-DD'
    minDate={params.minDate}
    maxDate={params.to}
    value={params.from}
    dateFormat='YYYY-MM-DD'
    showClearButton={false}
    addonBefore={<InputGroup.Text>From</InputGroup.Text>}
  />)

export const DateTo = bind(({ params, setDateTo: onDateTo }) =>
  <DatePicker
    onChange={onDateTo}
    placeholder='YYYY-MM-DD'
    minDate={params.from}
    maxDate={params.maxDate}
    value={params.to}
    dateFormat='YYYY-MM-DD'
    showClearButton={false}
    addonBefore={<InputGroup.Text>To</InputGroup.Text>}
  />)
