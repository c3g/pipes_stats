import * as k from 'constants/ActionTypes'
import { createAction } from 'redux-actions'
import { fetchStats } from './requests'

export const requestData = createAction(k.REQUEST_DATA)
export const receiveData = createAction(k.RECEIVE_DATA)
export const receiveError = createAction(k.RECEIVE_ERROR)

export function fetchData() {
  return (dispatch, getState) => {
    const { data } = getState()

    if (data.isLoading)
      return

    dispatch(requestData())

    fetchStats()
    .then(data => dispatch(receiveData(data)))
    .catch(err => dispatch(receiveError(err)))
  }
}
