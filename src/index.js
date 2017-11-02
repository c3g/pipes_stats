import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css'
import 'styles/global-styles'
import 'styles/checkbox.css'

import configureStore from 'store'
import Routes from 'routes'
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
  module.hot.accept('./routes', () => {
    /* eslint-disable global-require */
    const NextRoutes = require('routes').default
    render(
      <Provider store={store}>
        <NextRoutes />
      </Provider>,
      document.getElementById('root')
    )
  })
  module.hot.accept('./styles/global-styles', () => {
    /* eslint-disable global-require */
    require('styles/global-styles')
  })
}
