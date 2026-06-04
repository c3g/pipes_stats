/*
 * requests.js
 */

import axios from 'axios'
import queryString from './utils/queryString'

const { CancelToken } = axios

window.axios = axios

const BASE_URL = '/cgi-bin'

function fetchAPI(url, params, options = {}) {
  const { method = 'get', ...other } = options

  let finalURL = BASE_URL + url
  let requestData

  if (method === 'post' && params)
    requestData = params

  if (method === 'get' && params)
    finalURL += `?${queryString(params)}`

  const config = {
    method,
    url: finalURL,
    data: requestData,
    ...other
  }

  return axios(config).then(({ data }) => {
    if (data.ok)
      return Promise.resolve(data.data)
    return Promise.reject(data.message)
  })
}


let statsSource
export function fetchStats(params) {
  if (statsSource)
    statsSource.cancel()
  statsSource = CancelToken.source()
  return fetchAPI('/get-stats.py', params, { cancelToken: statsSource.token })
}

export const { isCancel } = axios
