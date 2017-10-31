import * as k from 'constants/ActionTypes'

const initialState = {
  isLoading: false,
  params: {},
  message: '',
}

export default function uiReducer(state = initialState, action) {
  switch (action.type) {
    case k.REQUEST_DATA:
      return { ...state, isLoading: true }
    case k.RECEIVE_DATA:
      return { ...state, isLoading: false, params: action.payload.params }
    case k.RECEIVE_ERROR:
      return { ...state, isLoading: false, message: action.payload }
    default:
      return state
  }
}
