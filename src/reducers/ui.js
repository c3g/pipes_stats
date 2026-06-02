import * as k from '../constants/ActionTypes'

const emptySet = new Set()

const oneYearAgo = new Date()
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
const defaultFrom = oneYearAgo.toISOString().slice(0, 10)

const initialState = {
  isLoading: false,
  params: {
    from: defaultFrom,
    to: undefined,
    merge: undefined,
    mergeProtocol: false,
    cluster: undefined,
    pipelines: { all: undefined, selected: emptySet },
    versions: { all: undefined, selected: emptySet },
    protocols: { all: undefined, selected: emptySet },
  },
  message: '',
  activePipeline: undefined,
}

function extractVersion(key) {
  const match = key.match(/-(\d+\.\d+.*)$/)
  return match ? match[1] : null
}

function extractProtocol(key) {
  const base = key.replace(/-(\d+\.\d+.*)$/, '')
  const match = base.match(/\.([^.]+)$/)
  return match ? match[1] : null
}

function getParams(state, { params, stats }) {
  const all = Object.keys(stats.byPipeline)
  const selected = state.pipelines.selected === emptySet ? new Set(all) : state.pipelines.selected

  const allVersions = [...new Set(all.map(extractVersion).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const selectedVersions = state.versions.selected === emptySet
    ? new Set(allVersions)
    : state.versions.selected

  const allProtocols = [...new Set(all.map(extractProtocol).filter(Boolean))].sort()
  const selectedProtocols = state.protocols.selected === emptySet
    ? new Set(allProtocols)
    : state.protocols.selected

  return {
    ...params,
    pipelines: { all, selected },
    versions: { all: allVersions, selected: selectedVersions },
    protocols: { all: allProtocols, selected: selectedProtocols },
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
      return { ...state, params: { ...state.params, from: action.payload,
        pipelines: { all: undefined, selected: emptySet },
        versions:  { all: undefined, selected: emptySet },
        protocols: { all: undefined, selected: emptySet },
      }}
    case k.SET_DATE_TO:
      return { ...state, params: { ...state.params, to: action.payload,
        pipelines: { all: undefined, selected: emptySet },
        versions:  { all: undefined, selected: emptySet },
        protocols: { all: undefined, selected: emptySet },
      }}
    case k.SET_MERGE: {
      const newState = { ...state, params: { ...state.params, merge: action.payload } }
      if (action.payload !== state.params.merge) {
        newState.params.pipelines = { all: undefined, selected: emptySet }
        newState.params.versions = { all: undefined, selected: emptySet }
        newState.params.protocols = { all: undefined, selected: emptySet }
      }
      return newState
    }

    case k.SET_PIPELINES:
      return { ...state, params: { ...state.params, pipelines: {
                ...state.params.pipelines, selected: new Set(action.payload) } } }

    case k.SET_VERSIONS:
      return { ...state, params: { ...state.params, versions: {
                ...state.params.versions, selected: new Set(action.payload) } } }

    case k.SET_PROTOCOL:
      return { ...state, params: { ...state.params, protocols: {
                ...state.params.protocols, selected: new Set(action.payload) } } }

    case k.SET_MERGE_PROTOCOL:
      return { ...state, params: { ...state.params, mergeProtocol: action.payload } }

    case k.SET_CLUSTER:
      return { ...state, params: { ...state.params, cluster: action.payload } }

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
