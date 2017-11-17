import React from 'react'
import { AppContainer } from 'containers'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import styled from 'styled-components'

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
