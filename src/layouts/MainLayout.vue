<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import {
  LayoutDashboard, FileText, Settings, User, KeyRound, LogOut,
  ChevronDown, ChevronRight, Building2, FolderOpen, Search, Send,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import CurrentProjectSelect from '@/components/CurrentProjectSelect.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

type TabId = 'dashboard' | 'documents' | 'admin' | 'profile'

function resolveTab(path: string): TabId {
  if (path.startsWith('/admin')) return 'admin'
  if (path.startsWith('/documents') || path.startsWith('/transmittals')) return 'documents'
  if (path.startsWith('/me')) return 'profile'
  return 'dashboard'
}

const activeTab = ref<TabId>(resolveTab(route.path))
const sidebarExpanded = ref(true)
const openSections = reactive<Record<string, boolean>>({
  companies: false,
  projects: false,
})
const userMenuOpen = ref(false)

watch(() => route.path, (path) => {
  activeTab.value = resolveTab(path)
})

function selectTab(tab: TabId) {
  if (activeTab.value === tab && sidebarExpanded.value) {
    sidebarExpanded.value = false
  } else {
    activeTab.value = tab
    sidebarExpanded.value = true
  }
}

function toggleSection(key: string) {
  openSections[key] = !openSections[key]
}

function logout() {
  auth.logout()
  router.push('/login')
}

const userInitial = computed(() => auth.user?.name?.charAt(0)?.toUpperCase() ?? 'U')
</script>

<template>
  <div>

    <!-- ═══════════════════════════════════════════════════════════
         ICON RAIL — fixed 60px wide, brand blue background
    ═══════════════════════════════════════════════════════════ -->
    <aside class="fixed top-0 left-0 h-full w-[60px] bg-brand flex flex-col items-center py-4 z-50">

      <!-- Logo -->
      <div class="mb-2 flex justify-center">
        <img src="/logo-sm.png" alt="Anthive" class="h-[34px]" />
      </div>

      <!-- Tab icon buttons -->
      <div class="flex-1 flex flex-col items-center w-full mt-4 overflow-y-auto">

        <!-- Dashboard -->
        <div class="flex justify-center w-full my-[14px]">
          <button
            @click="selectTab('dashboard')"
            title="Dashboard"
            class="relative w-9 h-9 flex items-center justify-center rounded transition-colors"
            :class="activeTab === 'dashboard' && sidebarExpanded
              ? 'bg-white/20 sidebar-active-arrow'
              : 'bg-brand-light hover:bg-white/10'"
          >
            <LayoutDashboard class="w-[22px] h-[22px] text-white" />
          </button>
        </div>

        <!-- Documents (client team only) -->
        <div v-if="auth.isClientTeam" class="flex justify-center w-full my-[14px]">
          <button
            @click="selectTab('documents')"
            title="Documents"
            class="relative w-9 h-9 flex items-center justify-center rounded transition-colors"
            :class="activeTab === 'documents' && sidebarExpanded
              ? 'bg-white/20 sidebar-active-arrow'
              : 'bg-brand-light hover:bg-white/10'"
          >
            <FileText class="w-[22px] h-[22px] text-white" />
          </button>
        </div>

        <!-- Administration (anthive team only) -->
        <div v-if="auth.isAnthiveTeam" class="flex justify-center w-full my-[14px]">
          <button
            @click="selectTab('admin')"
            title="Administration"
            class="relative w-9 h-9 flex items-center justify-center rounded transition-colors"
            :class="activeTab === 'admin' && sidebarExpanded
              ? 'bg-white/20 sidebar-active-arrow'
              : 'bg-brand-light hover:bg-white/10'"
          >
            <Settings class="w-[22px] h-[22px] text-white" />
          </button>
        </div>

        <!-- Profile -->
        <div class="flex justify-center w-full my-[14px]">
          <button
            @click="selectTab('profile')"
            title="Profile"
            class="relative w-9 h-9 flex items-center justify-center rounded transition-colors"
            :class="activeTab === 'profile' && sidebarExpanded
              ? 'bg-white/20 sidebar-active-arrow'
              : 'bg-brand-light hover:bg-white/10'"
          >
            <User class="w-[22px] h-[22px] text-white" />
          </button>
        </div>

      </div>

      <!-- User avatar at bottom of icon rail -->
      <div class="flex-shrink-0 mt-auto">
        <button
          class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold hover:bg-white/30 transition-colors"
          title="Profile"
          @click="selectTab('profile')"
        >
          {{ userInitial }}
        </button>
      </div>

    </aside>

    <!-- ═══════════════════════════════════════════════════════════
         TEXT PANEL — fixed 200px, light gray, left of icon rail
    ═══════════════════════════════════════════════════════════ -->
    <transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-show="sidebarExpanded"
        class="fixed top-0 left-[60px] h-full w-[200px] bg-sidebar-panel border-r border-sidebar-border z-40 flex flex-col"
      >
        <!-- Panel header / logo text -->
        <div class="h-[60px] flex items-center px-4 border-b border-sidebar-border flex-shrink-0">
          <span class="font-semibold text-sm text-heading tracking-tight">Anthive DMS</span>
        </div>

        <!-- Scrollable nav panels -->
        <div class="flex-1 overflow-y-auto p-4">

          <!-- ── Dashboard panel ── -->
          <div v-show="activeTab === 'dashboard'" class="mb-5">
            <RouterLink
              to="/dashboard"
              class="flex items-center h-[38px] px-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              exact-active-class="!text-nav-active"
            >
              <LayoutDashboard class="w-4 h-4 mr-2 flex-shrink-0" />
              Dashboard
            </RouterLink>
          </div>

          <!-- ── Documents panel (client team) ── -->
          <div v-show="activeTab === 'documents' && auth.isClientTeam" class="mb-5">
            <RouterLink
              to="/documents"
              class="flex items-center h-[38px] px-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              exact-active-class="!text-nav-active"
            >
              <FileText class="w-4 h-4 mr-2 flex-shrink-0" />
              Documents
            </RouterLink>
            <RouterLink
              to="/documents/upload"
              class="flex items-center h-[38px] pl-8 pr-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              exact-active-class="!text-nav-active"
            >
              Upload Document
            </RouterLink>
            <RouterLink
              to="/documents/search"
              class="flex items-center h-[38px] pl-8 pr-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              active-class="!text-nav-active"
            >
              <Search class="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              AI Search
            </RouterLink>
            <RouterLink
              to="/transmittals/inbox"
              class="flex items-center h-[38px] px-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              active-class="!text-nav-active"
            >
              <Send class="w-4 h-4 mr-2 flex-shrink-0" />
              Transmittals
            </RouterLink>
            <RouterLink
              to="/transmittals/sent"
              class="flex items-center h-[38px] pl-8 pr-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              active-class="!text-nav-active"
            >
              Sent
            </RouterLink>
            <RouterLink
              to="/transmittals/new"
              class="flex items-center h-[38px] pl-8 pr-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              active-class="!text-nav-active"
            >
              New Transmittal
            </RouterLink>
          </div>

          <!-- ── Administration panel (anthive team) ── -->
          <div v-show="activeTab === 'admin' && auth.isAnthiveTeam" class="mb-5">

            <!-- Companies section (collapsible) -->
            <button
              @click="toggleSection('companies')"
              class="w-full flex items-center justify-between h-[38px] px-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
            >
              <span class="flex items-center">
                <Building2 class="w-4 h-4 mr-2 flex-shrink-0" />
                Companies
              </span>
              <ChevronRight
                class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150"
                :class="openSections.companies ? 'rotate-90' : ''"
              />
            </button>
            <div v-show="openSections.companies" class="pl-3">
              <RouterLink
                to="/admin/companies"
                class="relative flex items-center h-[38px] pl-5 pr-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
                exact-active-class="!text-nav-active"
              >
                <span class="absolute left-1.5 w-[5px] h-[5px] rounded-full border border-[#8997bd] bg-[rgba(48,62,103,0.2)]"></span>
                All Companies
              </RouterLink>
            </div>

            <!-- Projects section (collapsible) -->
            <button
              @click="toggleSection('projects')"
              class="w-full flex items-center justify-between h-[38px] px-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors mt-0.5"
            >
              <span class="flex items-center">
                <FolderOpen class="w-4 h-4 mr-2 flex-shrink-0" />
                Projects
              </span>
              <ChevronRight
                class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150"
                :class="openSections.projects ? 'rotate-90' : ''"
              />
            </button>
            <div v-show="openSections.projects" class="pl-3">
              <RouterLink
                to="/admin/projects"
                class="relative flex items-center h-[38px] pl-5 pr-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
                exact-active-class="!text-nav-active"
              >
                <span class="absolute left-1.5 w-[5px] h-[5px] rounded-full border border-[#8997bd] bg-[rgba(48,62,103,0.2)]"></span>
                All Projects
              </RouterLink>
            </div>

          </div>

          <!-- ── Profile panel ── -->
          <div v-show="activeTab === 'profile'" class="mb-5">
            <RouterLink
              to="/me"
              class="flex items-center h-[38px] px-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              exact-active-class="!text-nav-active"
            >
              <User class="w-4 h-4 mr-2 flex-shrink-0" />
              Profile
            </RouterLink>
            <RouterLink
              to="/me/change-password"
              class="flex items-center h-[38px] px-2 rounded text-[13px] font-medium text-nav-text hover:text-nav-active transition-colors"
              exact-active-class="!text-nav-active"
            >
              <KeyRound class="w-4 h-4 mr-2 flex-shrink-0" />
              Change Password
            </RouterLink>
          </div>

        </div>
      </div>
    </transition>

    <!-- ═══════════════════════════════════════════════════════════
         TOPBAR — fixed 60px height, white, border-bottom
    ═══════════════════════════════════════════════════════════ -->
    <header
      class="fixed top-0 right-0 h-[60px] bg-white border-b border-sidebar-border z-30 flex items-center justify-between px-5 transition-all duration-200"
      :class="sidebarExpanded ? 'left-[260px]' : 'left-[60px]'"
    >

      <!-- Left: project selector or admin label -->
      <div>
        <CurrentProjectSelect v-if="auth.isClientTeam" />
        <span v-else class="text-sm font-medium text-topbar-text">Anthive Administration</span>
      </div>

      <!-- Right: user dropdown -->
      <div class="relative">
        <button
          @click="userMenuOpen = !userMenuOpen"
          class="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-topbar-icon-bg transition-colors"
        >
          <div class="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {{ userInitial }}
          </div>
          <span class="text-[13px] font-medium text-topbar-text max-w-[120px] truncate">{{ auth.user?.name }}</span>
          <ChevronDown class="w-3.5 h-3.5 text-topbar-text flex-shrink-0" />
        </button>

        <!-- Transparent backdrop to close dropdown on outside click -->
        <div v-if="userMenuOpen" class="fixed inset-0 z-40" @click="userMenuOpen = false" />

        <!-- Dropdown menu -->
        <div
          v-if="userMenuOpen"
          class="absolute right-0 mt-1 w-48 bg-white border border-sidebar-border rounded shadow-lg z-50 py-1"
        >
          <RouterLink
            to="/me"
            @click="userMenuOpen = false"
            class="flex items-center gap-2.5 px-4 py-2 text-[13px] text-nav-text hover:bg-sidebar-panel transition-colors"
          >
            <User class="w-4 h-4 text-m-muted flex-shrink-0" />
            Profile
          </RouterLink>
          <RouterLink
            to="/me/change-password"
            @click="userMenuOpen = false"
            class="flex items-center gap-2.5 px-4 py-2 text-[13px] text-nav-text hover:bg-sidebar-panel transition-colors"
          >
            <KeyRound class="w-4 h-4 text-m-muted flex-shrink-0" />
            Change Password
          </RouterLink>
          <hr class="my-1 border-sidebar-border" />
          <button
            @click="logout"
            class="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-sidebar-panel transition-colors"
          >
            <LogOut class="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>

    </header>

    <!-- ═══════════════════════════════════════════════════════════
         PAGE CONTENT — offset by sidebar + topbar
    ═══════════════════════════════════════════════════════════ -->
    <div
      class="transition-all duration-200"
      :class="sidebarExpanded ? 'ml-[260px]' : 'ml-[60px]'"
    >
      <main class="mt-[60px] min-h-[calc(100vh-112px)] bg-white p-2">
        <RouterView />
      </main>
      <footer class="px-4 py-4 text-[13px] text-footer-text border-t border-sidebar-border">
        © {{ new Date().getFullYear() }} Anthive DMS
      </footer>
    </div>

  </div>
</template>
