/*
 * requests.js
 */

import { parse as queryString } from 'querystring'

const BASE_URL = '/cgi'

function fetchAPI(url, params, method = 'GET') {
  let finalURL = BASE_URL + url
  let body = method === 'POST' && params ? JSON.stringify(params) : undefined
  if (method === 'GET' && params) {
    finalURL = `${url}?${queryString(params)}`
  }

  return fetch(finalURL, { body })
    .then(r => r.json())
    .then(res => res.ok ? Promise.resolve(res.data) : Promise.reject(res.message))
}

export function fetchStats(params) {
  return fetchAPI('/get-stats.py', params)
}
