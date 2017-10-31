import React from 'react'
import { Counter } from 'components'
import { createStructuredSelector, createSelector } from 'reselect'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { fetchData } from 'actions'

class AppContainer extends React.Component {
  constructor(props) {
    super(props)

    this.props.fetchData()
  }

  render() {
    return (
      <Counter />
    )
  }
}

const mapStateToProps = createStructuredSelector({
  counter: createSelector(state => state.counter, counterState => counterState),
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchData }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer)
