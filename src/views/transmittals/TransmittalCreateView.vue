<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import type { Document } from '@/interfaces/Document'
import type { TransmittalType } from '@/interfaces/Transmittal'

interface RecipientCandidate {
  id: string
  name: string
  email: string
  companyId: string
  companyName?: string
  companyCode?: string
  isProjectMember: boolean
}

const router = useRouter()
const auth = useAuthStore()
const projectId = computed(() => auth.user?.currentProjectId)
const companyId = computed(() => auth.user?.companyId)

const loading = ref(false)
const saving = ref(false)

const subject = ref('')
const message = ref('')
const transmittalTypeId = ref<string>('')

const memberRows = ref<RecipientCandidate[]>([])
const transmittalTypes = ref<TransmittalType[]>([])
const documentRows = ref<Document[]>([])

const toUsers = ref<string[]>([])
const ccUsers = ref<string[]>([])
const bccUsers = ref<string[]>([])
const selectedDocumentIds = ref<string[]>([])

const memberOptions = computed(() => {
  return (memberRows.value ?? []).filter((u) => u.id !== auth.user?.id)
})

const fileOptions = computed(() => documentRows.value.filter((d) => d.type === 'file'))

function toggleInArray(target: string[], id: string, checked: boolean) {
  const has = target.includes(id)
  if (checked && !has) target.push(id)
  if (!checked && has) target.splice(target.indexOf(id), 1)
}

function recipientPayload() {
  return [
    ...toUsers.value.map((userId) => ({ userId, recipientType: 'to' as const })),
    ...ccUsers.value.map((userId) => ({ userId, recipientType: 'cc' as const })),
    ...bccUsers.value.map((userId) => ({ userId, recipientType: 'bcc' as const })),
  ]
}

async function loadData() {
  if (!projectId.value || !companyId.value) return
  loading.value = true
  try {
    const [membersRes, typesRes, docsRes] = await Promise.all([
      axiosInstance.get('/transmittals/recipient-candidates', {
        params: { projectId: projectId.value },
      }),
      axiosInstance.get('/transmittal-types', { params: { projectId: projectId.value } }),
      axiosInstance.get('/documents', {
        params: { projectId: projectId.value, companyId: companyId.value, limit: 200 },
      }),
    ])

    memberRows.value = membersRes.data?.data ?? []
    transmittalTypes.value = typesRes.data?.data ?? []
    documentRows.value = docsRes.data?.data ?? []
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? 'Failed to load transmittal form data')
  } finally {
    loading.value = false
  }
}

async function createDraft() {
  if (!projectId.value) return
  saving.value = true
  try {
    const payload = {
      projectId: projectId.value,
      subject: subject.value.trim(),
      message: message.value.trim(),
      ...(transmittalTypeId.value ? { transmittalTypeId: transmittalTypeId.value } : {}),
      recipients: recipientPayload(),
      sourceDocumentIds: selectedDocumentIds.value,
    }
    const res = await axiosInstance.post('/transmittals', payload)
    toast.success('Draft transmittal created')
    router.push(`/transmittals/${res.data.id}`)
  } catch (error: any) {
    toast.error(error?.response?.data?.message ?? 'Failed to create transmittal draft')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
watch(projectId, loadData)
</script>

<template>
  <PageWrapper title="New Transmittal" breadcrumb="Transmittals / New">
    <div
      v-if="!projectId"
      class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[13px] text-amber-800"
    >
      Please select a project from the top bar first.
    </div>

    <div v-else-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>

    <div v-else class="space-y-4">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[12px] text-blue-800">
        Drafts are private and visible only to the creator.
      </div>

      <div class="bg-white border border-sidebar-border rounded-lg p-4 space-y-4">
        <div>
          <label class="block text-[13px] font-medium text-nav-text mb-1">Transmittal Type</label>
          <select
            v-model="transmittalTypeId"
            class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px]"
          >
            <option value="">General</option>
            <option v-for="item in transmittalTypes" :key="item.id" :value="item.id">
              {{ item.typeCode }} - {{ item.typeName }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-[13px] font-medium text-nav-text mb-1">Subject <span class="text-red-500">*</span></label>
          <input
            v-model="subject"
            class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px]"
            placeholder="Enter transmittal subject"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-nav-text mb-1">Message</label>
          <textarea
            v-model="message"
            class="w-full min-h-[110px] border border-sidebar-border rounded px-3 py-2 text-[13px]"
            placeholder="Optional message"
          />
        </div>
      </div>

      <div class="bg-white border border-sidebar-border rounded-lg p-4 space-y-4">
        <h3 class="text-[13px] font-semibold text-heading">Recipients</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-[12px] font-semibold text-nav-text mb-2">To</p>
            <div class="space-y-1 max-h-48 overflow-y-auto border border-sidebar-border rounded p-2">
              <label v-for="member in memberOptions" :key="`to-${member.id}`" class="flex items-center gap-2 text-[12px] text-body-text">
                <input
                  type="checkbox"
                  :checked="toUsers.includes(member.id)"
                  @change="toggleInArray(toUsers, member.id, ($event.target as HTMLInputElement).checked)"
                />
                <span>
                  {{ member.name }} ({{ member.email }})
                  <span v-if="!member.isProjectMember" class="text-amber-700"> - will be added to project on send</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <p class="text-[12px] font-semibold text-nav-text mb-2">Cc</p>
            <div class="space-y-1 max-h-48 overflow-y-auto border border-sidebar-border rounded p-2">
              <label v-for="member in memberOptions" :key="`cc-${member.id}`" class="flex items-center gap-2 text-[12px] text-body-text">
                <input
                  type="checkbox"
                  :checked="ccUsers.includes(member.id)"
                  @change="toggleInArray(ccUsers, member.id, ($event.target as HTMLInputElement).checked)"
                />
                <span>
                  {{ member.name }} ({{ member.email }})
                  <span v-if="!member.isProjectMember" class="text-amber-700"> - will be added to project on send</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <p class="text-[12px] font-semibold text-nav-text mb-2">Bcc</p>
            <div class="space-y-1 max-h-48 overflow-y-auto border border-sidebar-border rounded p-2">
              <label v-for="member in memberOptions" :key="`bcc-${member.id}`" class="flex items-center gap-2 text-[12px] text-body-text">
                <input
                  type="checkbox"
                  :checked="bccUsers.includes(member.id)"
                  @change="toggleInArray(bccUsers, member.id, ($event.target as HTMLInputElement).checked)"
                />
                <span>
                  {{ member.name }} ({{ member.email }})
                  <span v-if="!member.isProjectMember" class="text-amber-700"> - will be added to project on send</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-sidebar-border rounded-lg p-4 space-y-3">
        <h3 class="text-[13px] font-semibold text-heading">Source Documents (files only)</h3>
        <div class="max-h-56 overflow-y-auto border border-sidebar-border rounded p-2 space-y-1">
          <label v-for="doc in fileOptions" :key="doc.id" class="flex items-center gap-2 text-[12px] text-body-text">
            <input
              type="checkbox"
              :checked="selectedDocumentIds.includes(doc.id)"
              @change="toggleInArray(selectedDocumentIds, doc.id, ($event.target as HTMLInputElement).checked)"
            />
            <span>{{ doc.docCode }} (v{{ doc.version }})</span>
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button
          class="px-3 py-1.5 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel"
          @click="router.push('/transmittals/inbox')"
        >
          Cancel
        </button>
        <button
          :disabled="saving || !subject.trim()"
          class="px-3 py-1.5 text-[13px] bg-brand hover:bg-brand-light text-white rounded disabled:opacity-50"
          @click="createDraft"
        >
          {{ saving ? 'Saving…' : 'Create Draft' }}
        </button>
      </div>
    </div>
  </PageWrapper>
</template>
