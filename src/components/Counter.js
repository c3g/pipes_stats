import React from 'react'
import pure from 'recompose/pure'
import styled from 'styled-components'

const Intro = styled.p`font-size: large;`

function Counter({ increment, incrementIfOdd, decrement, counter }) {
  return (
    <section>
      <Intro>
        To get started, edit <code>src/routes/index.js </code>
        and save to reload.
      </Intro>
      <p>
        Clicked: {counter} times <button onClick={increment}>+</button> <button onClick={decrement}>-</button>{' '}
        <button onClick={incrementIfOdd}>Increment if odd</button>
      </p>
    </section>
  )
}

export default pure(Counter)
