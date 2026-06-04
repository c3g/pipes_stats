import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import styled from 'styled-components'

import { AppContainer } from '../containers'

const Container = styled.div`text-align: center;`

function AppRoutes() {
  return (
    <Router>
      <Container>
        <Routes>
          <Route path="/" element={<AppContainer />} />
        </Routes>
      </Container>
    </Router>
  )
}

export default AppRoutes
