<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import axiosInstance from '@/lib/axios'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import type { Transmittal, TransmittalRecipient } from '@/interfaces/Transmittal'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)

const loading = ref(false)
const sending = ref(false)
const item = ref<Transmittal | null>(null)

const toRecipients = computed(() => (item.value?.recipients ?? []).filter((r) => r.recipientType === 'to'))
const ccRecipients = computed(() => (item.value?.recipients ?? []).filter((r) => r.recipientType === 'cc'))
const bccRecipients = computed(() => (item.value?.recipients ?? []).filter((r) => r.recipientType === 'bcc'))

function recipientLabel(recipient: TransmittalRecipient) {
  if (recipient.recipientUser?.name) return recipient.recipientUser.name
  return recipient.company?.companyName ?? recipient.companyId
}

async function load() {
  loading.value = true
  try {
    const res = await axiosInstance.get(`/transmittals/${id.value}`)
    item.value = res.data
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? 'Failed to load transmittal')
    router.push('/transmittals/inbox')
  } finally {
    loading.value = false
  }
}

async function sendDraft() {
  if (!item.value || item.value.status !== 'draft') return
  sending.value = true
  try {
    await axiosInstance.post(`/transmittals/${item.value.id}/send`)
    toast.success('Transmittal sent')
    await load()
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? 'Failed to send transmittal')
  } finally {
    sending.value = false
  }
}

onMounted(load)
</script>

<template>
  <PageWrapper title="Transmittal Detail" breadcrumb="Transmittals / Detail">
    <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>

    <div v-else-if="!item" class="bg-white border border-sidebar-border rounded-lg p-4 text-[13px] text-m-muted">
      Transmittal not found.
    </div>

    <div v-else class="space-y-4">
      <div class="bg-white border border-sidebar-border rounded-lg p-4 space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-[15px] font-semibold text-heading">{{ item.transmittalCode }}</h3>
          <span
            class="px-2 py-0.5 rounded text-[11px] font-medium"
            :class="item.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
          >
            {{ item.status.toUpperCase() }}
          </span>
        </div>
        <p class="text-[13px] text-nav-text">{{ item.subject }}</p>
        <p class="text-[12px] text-body-text whitespace-pre-wrap">{{ item.message || '-' }}</p>
        <p class="text-[12px] text-m-muted">Sent: {{ item.sentAt ? new Date(item.sentAt).toLocaleString() : '-' }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white border border-sidebar-border rounded-lg p-4">
          <h4 class="text-[12px] font-semibold text-nav-text mb-2">To</h4>
          <ul class="space-y-1 text-[12px] text-body-text">
            <li v-for="r in toRecipients" :key="r.id">{{ recipientLabel(r) }}</li>
            <li v-if="toRecipients.length === 0" class="text-m-muted">-</li>
          </ul>
        </div>
        <div class="bg-white border border-sidebar-border rounded-lg p-4">
          <h4 class="text-[12px] font-semibold text-nav-text mb-2">Cc</h4>
          <ul class="space-y-1 text-[12px] text-body-text">
            <li v-for="r in ccRecipients" :key="r.id">{{ recipientLabel(r) }}</li>
            <li v-if="ccRecipients.length === 0" class="text-m-muted">-</li>
          </ul>
        </div>
        <div class="bg-white border border-sidebar-border rounded-lg p-4">
          <h4 class="text-[12px] font-semibold text-nav-text mb-2">Bcc</h4>
          <ul class="space-y-1 text-[12px] text-body-text">
            <li v-for="r in bccRecipients" :key="r.id">{{ recipientLabel(r) }}</li>
            <li v-if="bccRecipients.length === 0" class="text-m-muted">-</li>
          </ul>
        </div>
      </div>

      <div class="bg-white border border-sidebar-border rounded-lg p-4">
        <h4 class="text-[12px] font-semibold text-nav-text mb-2">Items</h4>
        <ul v-if="item.items?.length" class="space-y-1 text-[12px] text-body-text">
          <li v-for="entry in item.items" :key="entry.id">
            {{ entry.sourceDocumentId }} → {{ entry.recipientCompanyId }}
          </li>
        </ul>
        <ul v-else-if="item.status === 'draft' && item.draftSourceDocumentIds?.length" class="space-y-1 text-[12px] text-body-text">
          <li v-for="sourceId in item.draftSourceDocumentIds" :key="sourceId">
            {{ sourceId }}
          </li>
        </ul>
        <p v-else class="text-[12px] text-m-muted">No items</p>
      </div>

      <div class="flex justify-end gap-2">
        <button
          class="px-3 py-1.5 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel"
          @click="router.push('/transmittals/inbox')"
        >
          Back
        </button>
        <button
          v-if="item.status === 'draft'"
          :disabled="sending"
          class="px-3 py-1.5 text-[13px] bg-brand hover:bg-brand-light text-white rounded disabled:opacity-50"
          @click="sendDraft"
        >
          {{ sending ? 'Sending…' : 'Send' }}
        </button>
      </div>
    </div>
  </PageWrapper>
</template>
