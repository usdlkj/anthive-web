<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FolderPlus, Upload, ChevronRight, Home } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import DocumentTable from '@/components/documents/DocumentTable.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import AppDialog from '@/components/ui/AppDialog.vue'
import type { Document } from '@/interfaces/Document'
import type { ProjectField } from '@/interfaces/ProjectField'

const router = useRouter()
const auth = useAuthStore()

// --- Folder navigation state ---
interface Crumb { id: string | null; label: string }
const breadcrumbs = ref<Crumb[]>([{ id: null, label: 'Documents' }])
const currentParentId = computed(() => breadcrumbs.value[breadcrumbs.value.length - 1].id)

function navigateInto(folder: Document) {
  breadcrumbs.value.push({ id: folder.id, label: folder.docCode })
  load()
}
function navigateTo(index: number) {
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
  load()
}

// --- Data ---
const documents = ref<Document[]>([])
const fields = ref<ProjectField[]>([])
const loading = ref(false)

const projectId = computed(() => auth.user?.currentProjectId)
const companyId = computed(() => auth.user?.companyId)

async function load() {
  if (!projectId.value || !companyId.value) return
  loading.value = true
  try {
    const params: Record<string, string> = {
      projectId: projectId.value,
      companyId: companyId.value,
    }
    if (currentParentId.value) params.parentId = currentParentId.value
    const res = await axiosInstance.get('/documents', { params })
    documents.value = res.data?.data ?? []
  } catch {
    toast.error('Failed to load documents')
  } finally {
    loading.value = false
  }
}

async function loadFields() {
  if (!projectId.value) return
  try {
    const res = await axiosInstance.get('/project-fields', { params: { projectId: projectId.value } })
    fields.value = res.data?.data ?? res.data ?? []
  } catch {
    fields.value = []
  }
}

onMounted(async () => {
  await Promise.all([load(), loadFields()])
})

// Reload when project changes
watch(projectId, () => {
  breadcrumbs.value = [{ id: null, label: 'Documents' }]
  Promise.all([load(), loadFields()])
})

// --- New Folder dialog ---
const newFolderOpen = ref(false)
const newFolderCode = ref('')
const newFolderSaving = ref(false)

async function createFolder() {
  if (!newFolderCode.value.trim()) return
  newFolderSaving.value = true
  try {
    await axiosInstance.post('/documents', {
      docCode: newFolderCode.value.trim().toUpperCase(),
      projectId: projectId.value,
      companyId: companyId.value,
      type: 'folder',
      ...(currentParentId.value ? { parentDocumentId: currentParentId.value } : {}),
    })
    toast.success('Folder created')
    newFolderOpen.value = false
    newFolderCode.value = ''
    await load()
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Failed to create folder')
  } finally {
    newFolderSaving.value = false
  }
}

function openNewFolderDialog() {
  newFolderCode.value = ''
  newFolderOpen.value = true
}

function goUpload() {
  const query: Record<string, string> = {}
  if (currentParentId.value) query.parentId = currentParentId.value
  router.push({ path: '/documents/upload', query })
}
</script>

<template>
  <PageWrapper title="Document Register" breadcrumb="Documents">

    <!-- No project selected -->
    <div
      v-if="!projectId"
      class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[13px] text-amber-800"
    >
      Please select a project from the top bar to view documents.
    </div>

    <template v-else>
      <!-- Toolbar: folder breadcrumb left, action buttons right -->
      <div class="flex items-center justify-between mb-3">
        <!-- Folder breadcrumb -->
        <nav class="flex items-center gap-1 text-[13px] text-m-muted">
          <button
            v-for="(crumb, i) in breadcrumbs"
            :key="i"
            class="flex items-center gap-1 hover:text-nav-active transition-colors"
            @click="navigateTo(i)"
          >
            <Home v-if="i === 0" class="w-3.5 h-3.5" />
            <span v-else>{{ crumb.label }}</span>
            <ChevronRight v-if="i < breadcrumbs.length - 1" class="w-3.5 h-3.5 text-sidebar-border" />
          </button>
        </nav>

        <!-- Action buttons -->
        <div class="flex items-center gap-2">
          <button
            @click="openNewFolderDialog"
            class="flex items-center gap-1.5 px-3 py-1.5 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text"
          >
            <FolderPlus class="w-4 h-4 text-m-muted" />
            New Folder
          </button>
          <button
            @click="goUpload"
            class="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand hover:bg-brand-light text-white text-[13px] rounded transition-colors"
          >
            <Upload class="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>

      <!-- Document table -->
      <DocumentTable
        v-else
        :documents="documents"
        :project-fields="fields"
        @navigate="navigateInto"
      />
    </template>

  </PageWrapper>

  <!-- New Folder dialog — uses AppDialog instead of raw Teleport -->
  <AppDialog :open="newFolderOpen" title="New Folder" @close="newFolderOpen = false">
    <div class="space-y-4">
      <div>
        <label class="block text-[13px] font-medium text-nav-text mb-1">Folder Code <span class="text-red-500">*</span></label>
        <input
          v-model="newFolderCode"
          placeholder="e.g. ARCH"
          class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text uppercase focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
          @keyup.enter="createFolder"
        />
        <p class="text-[12px] text-m-muted mt-1">Unique code for this folder within the project.</p>
      </div>
      <div class="flex gap-2 justify-end pt-1">
        <button
          @click="newFolderOpen = false"
          class="px-3 py-1.5 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text"
        >
          Cancel
        </button>
        <button
          @click="createFolder"
          :disabled="newFolderSaving || !newFolderCode.trim()"
          class="px-3 py-1.5 text-[13px] bg-brand hover:bg-brand-light text-white rounded transition-colors disabled:opacity-50"
        >
          {{ newFolderSaving ? 'Creating…' : 'Create' }}
        </button>
      </div>
    </div>
  </AppDialog>
</template>
