import React from 'react'
import styled from 'styled-components'

const TopBar = styled.div`
  background-color: #222;
  height: 120px;
  padding: 20px;
  color: #fff;
`

function Header() {
  return (
    <TopBar>
      <h2>Welcome to Pipes Stats</h2>
    </TopBar>
  )
}

export default Header
