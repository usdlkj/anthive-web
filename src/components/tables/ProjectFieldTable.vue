<script setup lang="ts">
import { ref } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import BackofficeDataTable from './BackofficeDataTable.vue'
import ProjectFieldModal from '@/components/modals/ProjectFieldModal.vue'
import axiosInstance from '@/lib/axios'
import type { ProjectField } from '@/interfaces/ProjectField'

const props = defineProps<{ initialData: ProjectField[]; projectId: string; userRole?: string }>()
const data = ref<ProjectField[]>([...props.initialData])
const modalOpen = ref(false)
const selected = ref<ProjectField | null>(null)

const columns = [
  { key: 'fieldCode', label: 'Code' },
  { key: 'fieldText', label: 'Label' },
  { key: 'type', label: 'Type' },
  { key: 'visible', label: 'Visible' },
  { key: 'mandatory', label: 'Req.' },
  { key: 'sequence', label: 'Seq' },
  { key: 'actions', label: '' },
]

function openCreate() { selected.value = null; modalOpen.value = true }
function openEdit(f: ProjectField) { selected.value = f; modalOpen.value = true }

async function remove(f: ProjectField) {
  if (f.isSystem) { toast.error('Cannot delete system fields'); return }
  if (!confirm('Delete this field?')) return
  try {
    await axiosInstance.delete(`/project-fields/${f.id}`)
    data.value = data.value.filter(x => x.id !== f.id)
    toast.success('Field deleted')
  } catch { toast.error('Failed to delete') }
}

function onSaved(f: ProjectField) {
  const i = data.value.findIndex(x => x.id === f.id)
  if (i >= 0) data.value[i] = f; else data.value.push(f)
  modalOpen.value = false
}
</script>

<template>
  <div>
    <BackofficeDataTable :data="data as any" :columns="columns">
      <template #actions>
        <button @click="openCreate" class="px-3.5 py-1.5 bg-brand hover:bg-brand-light text-white text-[13px] rounded transition-colors">+ New Field</button>
      </template>
      <template #row="{ row }">
        <td class="px-4 py-3 font-mono text-[11px] font-medium text-m-muted">{{ row.fieldCode }}</td>
        <td class="px-4 py-3 text-body-text">{{ row.fieldText }}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-0.5 bg-sidebar-panel text-nav-text border border-sidebar-border rounded text-[11px]">{{ row.type }}</span>
        </td>
        <td class="px-4 py-3 text-center">
          <span :class="row.visible ? 'text-green-500' : 'text-sidebar-border'">{{ row.visible ? '●' : '○' }}</span>
        </td>
        <td class="px-4 py-3 text-center">
          <span :class="row.mandatory ? 'text-green-500' : 'text-sidebar-border'">{{ row.mandatory ? '●' : '○' }}</span>
        </td>
        <td class="px-4 py-3 text-center text-m-muted">{{ row.sequence }}</td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-1">
            <button @click="openEdit(row as any)"
              class="p-1.5 text-m-muted hover:text-nav-active rounded hover:bg-sidebar-panel transition-colors"><Pencil class="w-4 h-4" /></button>
            <button @click="remove(row as any)" :disabled="!!(row as any).isSystem"
              class="p-1.5 text-m-muted hover:text-red-500 rounded hover:bg-red-50 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"><Trash2 class="w-4 h-4" /></button>
          </div>
        </td>
      </template>
    </BackofficeDataTable>
    <ProjectFieldModal :open="modalOpen" :data="selected" :project-id="projectId" @close="modalOpen = false" @saved="onSaved" />
  </div>
</template>
