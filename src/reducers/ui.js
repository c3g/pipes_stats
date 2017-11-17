import * as k from '../constants/ActionTypes'

const emptySet = new Set()

const initialState = {
  isLoading: false,
  params: {
    from: undefined,
    to: undefined,
    merge: undefined,
    pipelines: { all: undefined, selected: emptySet },
  },
  message: '',
  activePipeline: undefined,
}

function getParams(state, { params, stats }) {
  const all = Object.keys(stats.byPipeline)
  const selected = state.pipelines.selected === emptySet ? new Set(all) : state.pipelines.selected

  return {
    ...params,
    pipelines: { all, selected }
  }
}

export default function uiReducer(state = initialState, action) {
  switch (action.type) {
    case k.REQUEST_DATA:
      return { ...state, isLoading: true }
    case k.RECEIVE_DATA:
      return { ...state, isLoading: false, params: getParams(state.params, action.payload) }
    case k.RECEIVE_ERROR:
      return { ...state, isLoading: false, message: action.payload }

    case k.SET_DATE_FROM:
      return { ...state, params: { ...state.params, from: action.payload } }
    case k.SET_DATE_TO:
      return { ...state, params: { ...state.params, to: action.payload } }
    case k.SET_MERGE:
      const newState = { ...state, params: { ...state.params, merge: action.payload } }
      if (action.payload !== state.params.merge)
        newState.params.pipelines = { all: undefined, selected: emptySet }
      return newState

    case k.SET_PIPELINES:
      return { ...state, params: { ...state.params, pipelines: {
                ...state.params.pipelines, selected: new Set(action.payload) } } }

    case k.SET_ACTIVE_PIPELINE:
      return { ...state, activePipeline: action.payload }
    case k.REMOVE_ACTIVE_PIPELINE:
      if (state.activePipeline === action.payload)
        return { ...state, activePipeline: undefined }
      return state

    default:
      return state
  }
}
