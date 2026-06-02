import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/index.js'

import configureStore from './store'
import Routes from './routes'
import { fetchData } from './actions'

const store = configureStore()

const root = createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <Routes />
  </Provider>
)

store.dispatch(fetchData())
