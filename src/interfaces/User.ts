export type UserRole = 'super_admin' | 'ops_admin' | 'company_admin' | 'manager' | 'user'

export const ANTHIVE_ROLES: UserRole[] = ['super_admin', 'ops_admin']
export const CLIENT_ROLES: UserRole[] = ['company_admin', 'manager', 'user']

export interface User {
  id: string
  name: string
  email: string
  phoneNumber: string
  role: UserRole
  lastLoginDate: string
  status: string
  companyId: string
  currentProjectId?: string
}
