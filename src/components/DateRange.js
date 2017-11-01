import React from 'react'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Grid, Row, Col } from 'react-bootstrap'
import DatePicker from 'react-bootstrap-date-picker'

import { setDateFrom, setDateTo } from 'actions'

class DateRange extends React.Component {
  render() {

    const { params } = this.props

    return (
      <Row>
        <Col xs={6}>
          <DatePicker
            onChange={this.props.setDateFrom}
            placeholder='From'
            minDate={params.minDate}
            maxDate={params.to}
            value={params.from}
            dateFormat='YYYY-MM-DD'
            showClearButton={false}
          />
        </Col>
        <Col xs={6}>
          <DatePicker
            onChange={this.props.setDateTo}
            placeholder='To'
            minDate={params.from}
            maxDate={params.maxDate}
            value={params.to}
            dateFormat='YYYY-MM-DD'
            showClearButton={false}
          />
        </Col>
      </Row>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  isLoading: createSelector(state => state.ui.isLoading, uiState => uiState),
  params: createSelector(state => state.ui.params, uiState => uiState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setDateFrom, setDateTo }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(DateRange)
