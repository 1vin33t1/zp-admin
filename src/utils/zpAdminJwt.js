let accessToken = null
let refreshPromise = null
let refreshIntervalId = null

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.failureReason ||
      data?.message ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

export const refreshZpAdminAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const data = await fetchJson('https://api.gramsamruddhi.in/auth/refresh/zp-admin', {
      method: 'POST',
      credentials: 'include',
    })

    if (!data?.accessToken) {
      throw new Error('Failed to refresh access token')
    }

    accessToken = data.accessToken
    return accessToken
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export const startZpAdminJwtScheduler = () => {
  if (refreshIntervalId) {
    return
  }

  refreshIntervalId = window.setInterval(() => {
    refreshZpAdminAccessToken().catch((error) => {
      console.error('JWT refresh failed:', error)
    })
  }, REFRESH_INTERVAL_MS)
}

export const stopZpAdminJwtScheduler = () => {
  if (!refreshIntervalId) {
    return
  }

  window.clearInterval(refreshIntervalId)
  refreshIntervalId = null
}

export const initializeZpAdminJwtFlow = async () => {
  startZpAdminJwtScheduler()
  return refreshZpAdminAccessToken()
}

export const getZpAdminAccessToken = async () => {
  if (accessToken) {
    return accessToken
  }

  return refreshZpAdminAccessToken()
}
