import * as k from '../constants/ActionTypes'

const initialState = {
  average: 0,
  samples: 0,
  submissions: 0,
  byPipeline: {},
}

export default function dataReducer(state = initialState, action) {
  switch (action.type) {
    case k.RECEIVE_DATA:
      return { ...action.payload.stats }
    default:
      return state
  }
}
