import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import styled from 'styled-components'

import { AppContainer } from '../containers'

const Container = styled.div`text-align: center;`

function Routes() {
  return (
    <Router>
      <Container>
        <Route path="/" component={AppContainer} />
      </Container>
    </Router>
  )
}

export default Routes
