import { combineReducers } from 'redux'
import stats from './stats'
import ui from './ui'

const rootReducer = combineReducers({
  stats,
  ui,
})

export default rootReducer
