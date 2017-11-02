/*
 * requests.js
 */

import axios from 'axios'
import queryString from 'utils/queryString'

const { CancelToken } = axios

window.axios = axios

const BASE_URL = '/cgi'

function fetchAPI(url, params, options = {}) {
  let { method = 'get', ...other } = options

  let finalURL = BASE_URL + url
  let data = undefined

  if (method === 'post' && params)
    data = params

  if (method === 'get' && params)
    finalURL += `?${queryString(params)}`

  const config = {
    method: method,
    url: finalURL,
    data: data,
    ...other
  }

  return axios(config).then(({ data }) => {
    if (data.ok)
      return Promise.resolve(data.data)
    else
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

export const isCancel = axios.isCancel
