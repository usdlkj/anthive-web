import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import { ANTHIVE_ROLES, CLIENT_ROLES } from '@/interfaces/User'
import type { UserRole } from '@/interfaces/User'

const COOKIE = 'anthive'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        { path: 'me', component: () => import('@/views/me/ProfileView.vue') },
        { path: 'me/change-password', component: () => import('@/views/me/ChangePasswordView.vue') },
        {
          path: 'documents',
          component: () => import('@/views/documents/DocumentsView.vue'),
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'documents/upload',
          component: () => import('@/views/documents/DocumentUploadView.vue'),
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'documents/search',
          component: () => import('@/views/documents/SearchView.vue'),
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'transmittals',
          redirect: '/transmittals/inbox',
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'transmittals/inbox',
          component: () => import('@/views/transmittals/TransmittalsInboxView.vue'),
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'transmittals/sent',
          component: () => import('@/views/transmittals/TransmittalsSentView.vue'),
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'transmittals/new',
          component: () => import('@/views/transmittals/TransmittalCreateView.vue'),
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'transmittals/:id',
          component: () => import('@/views/transmittals/TransmittalDetailView.vue'),
          meta: { requiresTeam: 'client' },
        },
        {
          path: 'admin/companies',
          component: () => import('@/views/admin/companies/CompaniesView.vue'),
          meta: { requiresTeam: 'anthive' },
        },
        {
          path: 'admin/companies/:id/users',
          component: () => import('@/views/admin/companies/CompanyUsersView.vue'),
          meta: { requiresTeam: 'anthive' },
        },
        {
          path: 'admin/projects',
          component: () => import('@/views/admin/projects/ProjectsView.vue'),
          meta: { requiresTeam: 'anthive' },
        },
        {
          path: 'admin/projects/:projectId/fields',
          component: () => import('@/views/admin/projects/ProjectFieldsView.vue'),
          meta: { requiresTeam: 'anthive' },
        },
        {
          path: 'admin/projects/:projectId/members',
          component: () => import('@/views/admin/projects/ProjectMembersView.vue'),
          meta: { requiresTeam: 'anthive' },
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach(async (to) => {
  const token = Cookies.get(COOKIE)

  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) return '/dashboard'

  const requiresTeam = to.meta.requiresTeam as 'anthive' | 'client' | undefined
  if (requiresTeam && token) {
    // Lazily import store to avoid circular dependency at module load time
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()

    if (!auth.user) await auth.fetchMe()

    const role = auth.user?.role as UserRole | undefined
    if (!role) return '/login'

    if (requiresTeam === 'anthive' && !ANTHIVE_ROLES.includes(role)) return '/dashboard'
    if (requiresTeam === 'client' && !CLIENT_ROLES.includes(role)) return '/dashboard'
  }
})
