import axios from 'axios'
import Cookies from 'js-cookie'
import { getApiBaseUrl } from './api'

const ACCESS_COOKIE = 'anthive'
const REFRESH_COOKIE = 'anthive-refresh'

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get(ACCESS_COOKIE)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Attempt token refresh once on 401 (skip if it's an auth route itself)
    const isAuthRoute = /\/auth\/(refresh|login|logout)/.test(originalRequest.url ?? '')
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true
      const refreshToken = Cookies.get(REFRESH_COOKIE)
      if (refreshToken) {
        try {
          const res = await axiosInstance.post(
            '/auth/refresh',
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          )
          const { access_token, refresh_token } = res.data
          Cookies.set(ACCESS_COOKIE, access_token, { expires: 1 })
          Cookies.set(REFRESH_COOKIE, refresh_token, { expires: 7 })
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return axiosInstance(originalRequest)
        } catch {
          // Refresh failed — clear cookies and let router guard redirect to login
          Cookies.remove(ACCESS_COOKIE)
          Cookies.remove(REFRESH_COOKIE)
        }
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
