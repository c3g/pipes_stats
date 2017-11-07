import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Grid, Row, Col, InputGroup } from 'react-bootstrap'

import Icon from 'components/Icon'
import DatePicker from 'components/DatePicker'

import { setDateFrom, setDateTo } from 'actions'

const { Addon } = InputGroup


const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.isLoading, uiState => uiState),
  params: createSelector(state => state.ui.params, uiState => uiState),
})

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ setDateFrom, setDateTo }, dispatch)
}

const bind = connect(mapStateToProps, mapDispatchToProps)


export const DateFrom = bind(({ params, setDateFrom }) => 
  <DatePicker
    onChange={setDateFrom}
    placeholder='From'
    minDate={params.minDate}
    maxDate={params.to}
    value={params.from}
    dateFormat='YYYY-MM-DD'
    showClearButton={false}
    addonBefore={<Addon><Icon name='calendar'/>From</Addon>}
  />)

export const DateTo = bind(({ params, setDateTo }) =>
  <DatePicker
    onChange={setDateTo}
    placeholder='To'
    minDate={params.from}
    maxDate={params.maxDate}
    value={params.to}
    dateFormat='YYYY-MM-DD'
    showClearButton={false}
    addonBefore={<Addon><Icon name='calendar'/>To</Addon>}
  />)

