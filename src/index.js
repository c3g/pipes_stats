import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
import './styles/index.js'

import configureStore from './store'
import Routes from './routes'
import { fetchData } from './actions'

const store = configureStore()

render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root')
)

store.dispatch(fetchData())

if (module.hot) {
  /* eslint-disable global-require */

  module.hot.accept('./routes', () => {
    const NextRoutes = require('./routes').default
    render(
      <Provider store={store}>
        <NextRoutes />
      </Provider>,
      document.getElementById('root')
    )
  })

  module.hot.accept('./styles', () => {
    require('./styles/index.js')
  })
}
