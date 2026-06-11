import * as k from './constants/ActionTypes'
import { fetchStats, isCancel } from './requests'
import { normalizeData } from './models'

const createAction = (type) => (payload) => ({ type, payload })

function reloadData(fn) {
  return function reloadAction(...args) {
    return (dispatch, getState) => {
      dispatch(fn(...args))
      dispatch(fetchData())
    }
  }
}

export const setDateFrom  = reloadData(createAction(k.SET_DATE_FROM))
export const setDateTo    = reloadData(createAction(k.SET_DATE_TO))
export const setMerge     = reloadData(createAction(k.SET_MERGE))
export const setCluster   = reloadData(createAction(k.SET_CLUSTER))

export const setPipelines         = createAction(k.SET_PIPELINES)
export const setVersions          = createAction(k.SET_VERSIONS)
export const setProtocols         = createAction(k.SET_PROTOCOL)
export const setMergeProtocol     = createAction(k.SET_MERGE_PROTOCOL)
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
      from:        ui.params.from,
      to:          ui.params.to,
      merge:       ui.params.merge,
      cluster:     ui.params.cluster,
      granularity: getGranularity(ui.params.from, ui.params.to),
    }
    fetchStats(params)
    .then(data => normalizeData(data))
    .then(data => dispatch(receiveData(data)))
    .catch(err => !isCancel(err) && dispatch(receiveError(err)))
  }
}

function getGranularity(from, to) {
  if (!from) return 'month'
  const fromDate = new Date(from)
  const toDate = new Date(to || Date.now())
  const days = Math.round((toDate - fromDate) / 86400000)
  const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth())
  if (days <= 21) return 'day'
  return months <= 3 ? 'week' : 'month'
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
