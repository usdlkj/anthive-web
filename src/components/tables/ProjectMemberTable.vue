<script setup lang="ts">
import { ref } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import BackofficeDataTable from './BackofficeDataTable.vue'
import ProjectMemberModal from '@/components/modals/ProjectMemberModal.vue'
import axiosInstance from '@/lib/axios'
import { formatWibDate } from '@/lib/formatters'
import type { ProjectMember } from '@/interfaces/ProjectMember'

const props = defineProps<{ initialData: ProjectMember[]; projectId: string; userRole?: string }>()
const data = ref<ProjectMember[]>([...props.initialData])
const modalOpen = ref(false)

const columns = [
  { key: 'userId', label: 'User ID' },
  { key: 'createdAt', label: 'Added' },
  { key: 'actions', label: '' },
]

async function remove(id: string) {
  if (!confirm('Remove this member?')) return
  try {
    await axiosInstance.delete(`/project-members/${id}`)
    data.value = data.value.filter(m => m.id !== id)
    toast.success('Member removed')
  } catch { toast.error('Failed to remove') }
}

function onSaved(m: ProjectMember) {
  data.value.push(m)
  modalOpen.value = false
}
</script>

<template>
  <div>
    <BackofficeDataTable :data="data as any" :columns="columns">
      <template #actions>
        <button @click="modalOpen = true" class="px-3.5 py-1.5 bg-brand hover:bg-brand-light text-white text-[13px] rounded transition-colors">+ Add Member</button>
      </template>
      <template #row="{ row }">
        <td class="px-4 py-3 font-mono text-[11px] text-m-muted">{{ row.userId }}</td>
        <td class="px-4 py-3 text-m-muted text-[13px]">{{ formatWibDate(row.createdAt as string) }}</td>
        <td class="px-4 py-3">
          <button @click="remove(row.id as string)"
            class="p-1.5 text-m-muted hover:text-red-500 rounded hover:bg-red-50 transition-colors"><Trash2 class="w-4 h-4" /></button>
        </td>
      </template>
    </BackofficeDataTable>
    <ProjectMemberModal :open="modalOpen" :project-id="projectId" @close="modalOpen = false" @saved="onSaved" />
  </div>
</template>
