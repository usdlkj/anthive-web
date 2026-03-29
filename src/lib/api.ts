export const getApiBaseUrl = (): string => {
  const rawBase = import.meta.env.VITE_API_BASE as string | undefined
  if (!rawBase) return 'http://localhost:3000/api'
  const trimmed = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}
