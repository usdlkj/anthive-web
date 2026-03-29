<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, Trash2, List, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import BackofficeDataTable from './BackofficeDataTable.vue'
import ProjectModal from '@/components/modals/ProjectModal.vue'
import axiosInstance from '@/lib/axios'
import type { Project } from '@/interfaces/Project'

const props = defineProps<{ initialData: Project[]; userRole?: string }>()
const router = useRouter()
const data = ref<Project[]>([...props.initialData])
const modalOpen = ref(false)
const selected = ref<Project | null>(null)

const columns = [
  { key: 'projectCode', label: 'Code' },
  { key: 'projectName', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: '' },
]

function openCreate() { selected.value = null; modalOpen.value = true }
function openEdit(p: Project) { selected.value = p; modalOpen.value = true }

async function remove(id: string) {
  if (!confirm('Delete this project?')) return
  try {
    await axiosInstance.delete(`/projects/${id}`)
    data.value = data.value.filter(p => p.id !== id)
    toast.success('Project deleted')
  } catch { toast.error('Failed to delete') }
}

function onSaved(p: Project) {
  const i = data.value.findIndex(x => x.id === p.id)
  if (i >= 0) data.value[i] = p; else data.value.unshift(p)
  modalOpen.value = false
}
</script>

<template>
  <div>
    <BackofficeDataTable :data="data as any" :columns="columns">
      <template #actions>
        <button @click="openCreate" class="px-3.5 py-1.5 bg-brand hover:bg-brand-light text-white text-[13px] rounded transition-colors">+ New Project</button>
      </template>
      <template #row="{ row }">
        <td class="px-4 py-3 font-mono text-xs font-medium text-m-muted">{{ row.projectCode }}</td>
        <td class="px-4 py-3 font-medium text-body-text">{{ row.projectName }}</td>
        <td class="px-4 py-3 text-m-muted text-[13px]">{{ row.description }}</td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-1">
            <button @click="router.push(`/admin/projects/${row.id}/fields`)" title="Fields"
              class="p-1.5 text-m-muted hover:text-nav-active rounded hover:bg-sidebar-panel transition-colors"><List class="w-4 h-4" /></button>
            <button @click="router.push(`/admin/projects/${row.id}/members`)" title="Members"
              class="p-1.5 text-m-muted hover:text-nav-active rounded hover:bg-sidebar-panel transition-colors"><Users class="w-4 h-4" /></button>
            <button @click="openEdit(row as any)"
              class="p-1.5 text-m-muted hover:text-nav-active rounded hover:bg-sidebar-panel transition-colors"><Pencil class="w-4 h-4" /></button>
            <button @click="remove(row.id as string)"
              class="p-1.5 text-m-muted hover:text-red-500 rounded hover:bg-red-50 transition-colors"><Trash2 class="w-4 h-4" /></button>
          </div>
        </td>
      </template>
    </BackofficeDataTable>
    <ProjectModal :open="modalOpen" :data="selected" @close="modalOpen = false" @saved="onSaved" />
  </div>
</template>
