import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import axiosInstance from '@/lib/axios'
import type { User } from '@/interfaces/User'
import { ANTHIVE_ROLES, CLIENT_ROLES } from '@/interfaces/User'

const ACCESS_COOKIE = 'anthive'
const REFRESH_COOKIE = 'anthive-refresh'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isAnthiveTeam = computed(() =>
    ANTHIVE_ROLES.includes(user.value?.role as any),
  )
  const isClientTeam = computed(() =>
    CLIENT_ROLES.includes(user.value?.role as any),
  )

  async function login(email: string, password: string) {
    const res = await axiosInstance.post('/auth/login', { email, password })
    const { access_token, refresh_token } = res.data
    token.value = access_token
    Cookies.set(ACCESS_COOKIE, access_token, { expires: 1 })
    Cookies.set(REFRESH_COOKIE, refresh_token, { expires: 7 })
    await fetchMe()
  }

  async function refresh() {
    const refreshToken = Cookies.get(REFRESH_COOKIE)
    if (!refreshToken) throw new Error('No refresh token')
    const res = await axiosInstance.post(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    )
    const { access_token, refresh_token } = res.data
    token.value = access_token
    Cookies.set(ACCESS_COOKIE, access_token, { expires: 1 })
    Cookies.set(REFRESH_COOKIE, refresh_token, { expires: 7 })
    return access_token
  }

  async function fetchMe() {
    try {
      const res = await axiosInstance.get('/users/me')
      user.value = res.data
    } catch {
      logout()
    }
  }

  async function logout() {
    try {
      await axiosInstance.post('/auth/logout')
    } catch {
      // best-effort: clear locally even if backend call fails
    }
    token.value = null
    user.value = null
    Cookies.remove(ACCESS_COOKIE)
    Cookies.remove(REFRESH_COOKIE)
  }

  async function init() {
    const saved = Cookies.get(ACCESS_COOKIE)
    if (saved) {
      token.value = saved
      await fetchMe()
    }
  }

  async function updateCurrentProject(projectId: string | null) {
    await axiosInstance.patch('/users/me/current-project', { currentProjectId: projectId })
    if (user.value) user.value.currentProjectId = projectId ?? undefined
  }

  return { user, token, isAnthiveTeam, isClientTeam, login, logout, refresh, fetchMe, init, updateCurrentProject }
})
