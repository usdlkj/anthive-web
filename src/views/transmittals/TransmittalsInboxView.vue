<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import type { Transmittal } from '@/interfaces/Transmittal'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const rows = ref<Transmittal[]>([])
const projectId = computed(() => auth.user?.currentProjectId)

async function load() {
  if (!projectId.value) return
  loading.value = true
  try {
    const res = await axiosInstance.get('/transmittals/inbox', {
      params: { projectId: projectId.value },
    })
    rows.value = res.data?.data ?? []
  } catch (error: any) {
    rows.value = []
    toast.error(error?.response?.data?.message ?? 'Failed to load inbox transmittals')
  } finally {
    loading.value = false
  }
}

function openDetail(id: string) {
  router.push(`/transmittals/${id}`)
}

onMounted(load)
watch(projectId, load)
</script>

<template>
  <PageWrapper title="Transmittal Inbox" breadcrumb="Transmittals / Inbox">
    <div
      v-if="!projectId"
      class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[13px] text-amber-800"
    >
      Please select a project from the top bar first.
    </div>

    <div v-else-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>

    <div
      v-else-if="rows.length === 0"
      class="bg-white border border-sidebar-border rounded-lg p-5 text-[13px] text-m-muted"
    >
      No received transmittals yet.
    </div>

    <div v-else class="bg-white border border-sidebar-border rounded-lg overflow-hidden">
      <table class="w-full text-[13px]">
        <thead class="bg-sidebar-panel text-nav-text">
          <tr class="text-left">
            <th class="px-3 py-2.5 font-semibold">Code</th>
            <th class="px-3 py-2.5 font-semibold">Subject</th>
            <th class="px-3 py-2.5 font-semibold">Sender</th>
            <th class="px-3 py-2.5 font-semibold">Sent At</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in rows"
            :key="item.id"
            class="border-t border-sidebar-border hover:bg-sidebar-panel/60 cursor-pointer"
            @click="openDetail(item.id)"
          >
            <td class="px-3 py-2.5 font-medium text-nav-text">{{ item.transmittalCode }}</td>
            <td class="px-3 py-2.5 text-body-text">{{ item.subject }}</td>
            <td class="px-3 py-2.5 text-body-text">{{ item.senderCompanyId }}</td>
            <td class="px-3 py-2.5 text-body-text">{{ item.sentAt ? new Date(item.sentAt).toLocaleString() : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </PageWrapper>
</template>
