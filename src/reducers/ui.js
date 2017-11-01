import * as k from 'constants/ActionTypes'

const initialState = {
  isLoading: false,
  params: {},
  message: '',
}

function parseParams({ ...params }) {
  return {
    ...params
  }
}

export default function uiReducer(state = initialState, action) {
  switch (action.type) {
    case k.REQUEST_DATA:
      return { ...state, isLoading: true }
    case k.RECEIVE_DATA:
      return { ...state, isLoading: false, params: parseParams(action.payload.params) }
    case k.SET_DATE_FROM:
      return { ...state, params: { ...state.params, from: action.payload } }
    case k.SET_DATE_TO:
      return { ...state, params: { ...state.params, to: action.payload } }
    case k.SET_MERGE:
      return { ...state, params: { ...state.params, merge: action.payload } }
    case k.SET_PIPELINES:
      return { ...state, params: { ...state.params, pipelines: action.payload } }
    case k.RECEIVE_ERROR:
      return { ...state, isLoading: false, message: action.payload }
    default:
      return state
  }
}
