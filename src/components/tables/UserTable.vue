<script setup lang="ts">
import { ref } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import BackofficeDataTable from './BackofficeDataTable.vue'
import UserModal from '@/components/modals/UserModal.vue'
import axiosInstance from '@/lib/axios'
import { formatWibDate } from '@/lib/formatters'
import type { User } from '@/interfaces/User'

const props = defineProps<{ initialData: User[]; companyId: string; userRole?: string }>()
const data = ref<User[]>([...props.initialData])
const modalOpen = ref(false)
const selected = ref<User | null>(null)

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'lastLoginDate', label: 'Last Login' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

function openCreate() { selected.value = null; modalOpen.value = true }
function openEdit(u: User) { selected.value = u; modalOpen.value = true }

async function remove(id: string) {
  if (!confirm('Delete this user?')) return
  try {
    await axiosInstance.delete(`/users/${id}`)
    data.value = data.value.filter(u => u.id !== id)
    toast.success('User deleted')
  } catch { toast.error('Failed to delete') }
}

function onSaved(u: User) {
  const i = data.value.findIndex(x => x.id === u.id)
  if (i >= 0) data.value[i] = u; else data.value.unshift(u)
  modalOpen.value = false
}
</script>

<template>
  <div>
    <BackofficeDataTable :data="data as any" :columns="columns">
      <template #actions>
        <button @click="openCreate" class="px-3.5 py-1.5 bg-brand hover:bg-brand-light text-white text-[13px] rounded transition-colors">+ New User</button>
      </template>
      <template #row="{ row }">
        <td class="px-4 py-3 font-medium text-body-text">{{ row.name }}</td>
        <td class="px-4 py-3 text-nav-text text-[13px]">{{ row.email }}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-0.5 bg-sidebar-panel text-nav-text border border-sidebar-border rounded text-[11px] font-mono">{{ row.role }}</span>
        </td>
        <td class="px-4 py-3 text-m-muted text-[13px]">{{ formatWibDate(row.lastLoginDate as string) }}</td>
        <td class="px-4 py-3">
          <span :class="['px-2 py-0.5 rounded text-[11px] font-medium', row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-sidebar-panel text-m-muted']">{{ row.status }}</span>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-1">
            <button @click="openEdit(row as any)"
              class="p-1.5 text-m-muted hover:text-nav-active rounded hover:bg-sidebar-panel transition-colors"><Pencil class="w-4 h-4" /></button>
            <button @click="remove(row.id as string)"
              class="p-1.5 text-m-muted hover:text-red-500 rounded hover:bg-red-50 transition-colors"><Trash2 class="w-4 h-4" /></button>
          </div>
        </td>
      </template>
    </BackofficeDataTable>
    <UserModal :open="modalOpen" :data="selected" :company-id="companyId" @close="modalOpen = false" @saved="onSaved" />
  </div>
</template>
