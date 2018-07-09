import { createAction } from 'redux-actions'

import * as k from './constants/ActionTypes'
import { fetchStats, isCancel } from './requests'
import { normalizeData } from './models'

function reloadData(fn) {
  return function(...args) {
    return (dispatch, getState) => {
      dispatch(fn(...args))
      dispatch(fetchData())
    }
  }
}

export const setDateFrom  = reloadData(createAction(k.SET_DATE_FROM))
export const setDateTo    = reloadData(createAction(k.SET_DATE_TO))
export const setMerge     = reloadData(createAction(k.SET_MERGE))

export const setPipelines         = createAction(k.SET_PIPELINES)
export const setActivePipeline    = createAction(k.SET_ACTIVE_PIPELINE)
export const removeActivePipeline = createAction(k.REMOVE_ACTIVE_PIPELINE)

export const requestData  = createAction(k.REQUEST_DATA)
export const receiveData  = createAction(k.RECEIVE_DATA)
export const receiveError = createAction(k.RECEIVE_ERROR)

export function fetchData() {
  return (dispatch, getState) => {
    const { ui } = getState()

    dispatch(requestData())

    const params = {
      from:      ui.params.from,
      to:        ui.params.to,
      merge:     ui.params.merge,
      pipelines: ui.params.pipelines.selected,
    }
    fetchStats(params)
    .then(data => normalizeData(data))
    .then(data => dispatch(receiveData(data)))
    .catch(err => !isCancel(err) && dispatch(receiveError(err)))
  }
}

export function printPDF() {
  const previousElements = document.querySelectorAll('.print-only')
  previousElements.forEach(node => {
    document.body.removeChild(node)
  })

  const elements = document.querySelectorAll([
    '.App-inner > .row:first-child > *',
    '.App-inner > .row:not(:first-child)',
  ].join(', '))
  elements.forEach(node => {
    const newNode = node.cloneNode(true)
    newNode.className = 'print-only'
    document.body.appendChild(newNode)
  })

  window.print()
}
