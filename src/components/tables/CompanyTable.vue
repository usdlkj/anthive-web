<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, Trash2, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import BackofficeDataTable from './BackofficeDataTable.vue'
import CompanyModal from '@/components/modals/CompanyModal.vue'
import axiosInstance from '@/lib/axios'
import type { Company } from '@/interfaces/Company'

const props = defineProps<{ initialData: Company[]; userRole?: string }>()
const router = useRouter()
const data = ref<Company[]>([...props.initialData])
const modalOpen = ref(false)
const selected = ref<Company | null>(null)

const columns = [
  { key: 'companyCode', label: 'Code' },
  { key: 'companyName', label: 'Name' },
  { key: 'tradingName', label: 'Trading Name' },
  { key: 'email', label: 'Email' },
  { key: 'actions', label: '' },
]

function openCreate() { selected.value = null; modalOpen.value = true }
function openEdit(c: Company) { selected.value = c; modalOpen.value = true }

async function remove(id: string) {
  if (!confirm('Delete this company?')) return
  try {
    await axiosInstance.delete(`/companies/${id}`)
    data.value = data.value.filter(c => c.id !== id)
    toast.success('Company deleted')
  } catch { toast.error('Failed to delete') }
}

function onSaved(c: Company) {
  const i = data.value.findIndex(x => x.id === c.id)
  if (i >= 0) data.value[i] = c; else data.value.unshift(c)
  modalOpen.value = false
}
</script>

<template>
  <div>
    <BackofficeDataTable :data="data as any" :columns="columns">
      <template #actions>
        <button @click="openCreate" class="px-3.5 py-1.5 bg-brand hover:bg-brand-light text-white text-[13px] rounded transition-colors">+ New Company</button>
      </template>
      <template #row="{ row }">
        <td class="px-4 py-3 font-mono text-xs font-medium text-m-muted">{{ row.companyCode }}</td>
        <td class="px-4 py-3 font-medium text-body-text">{{ row.companyName }}</td>
        <td class="px-4 py-3 text-nav-text">{{ row.tradingName }}</td>
        <td class="px-4 py-3 text-nav-text">{{ row.email }}</td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-1">
            <button @click="router.push(`/admin/companies/${row.id}/users`)" title="View users"
              class="p-1.5 text-m-muted hover:text-nav-active rounded hover:bg-sidebar-panel transition-colors">
              <Users class="w-4 h-4" />
            </button>
            <button @click="openEdit(row as any)"
              class="p-1.5 text-m-muted hover:text-nav-active rounded hover:bg-sidebar-panel transition-colors">
              <Pencil class="w-4 h-4" />
            </button>
            <button @click="remove(row.id as string)"
              class="p-1.5 text-m-muted hover:text-red-500 rounded hover:bg-red-50 transition-colors">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </td>
      </template>
    </BackofficeDataTable>
    <CompanyModal :open="modalOpen" :data="selected" @close="modalOpen = false" @saved="onSaved" />
  </div>
</template>
