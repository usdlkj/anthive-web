<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import type { ProjectField } from '@/interfaces/ProjectField'

const props = defineProps<{
  fields: ProjectField[]
  projectId: string
  parentDocumentId?: string
}>()

const router = useRouter()
const auth = useAuthStore()

const file = ref<File | null>(null)
const docCode = ref('')
const fieldValues = reactive<Record<string, string>>({})
const uploading = ref(false)
const progress = ref(0)

function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function cancelBack() {
  const query: Record<string, string> = {}
  if (props.parentDocumentId) query.parentId = props.parentDocumentId
  router.push({ path: '/documents', query })
}

async function submit() {
  if (!file.value) { toast.error('Please select a file'); return }
  if (!docCode.value.trim()) { toast.error('Document code is required'); return }

  uploading.value = true
  try {
    // Step 1: upload physical file → get fileId
    const fd = new FormData()
    fd.append('file', file.value)
    const fileRes = await axiosInstance.post('/file', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        progress.value = Math.round((e.loaded / (e.total ?? 1)) * 100)
      },
    })
    const fileId = fileRes.data?.id ?? fileRes.data?.fileId

    // Step 2: create document record
    const documentField: Record<string, string> = {}
    for (const f of props.fields) {
      if (fieldValues[f.fieldCode] != null) documentField[f.fieldCode] = fieldValues[f.fieldCode]
    }

    await axiosInstance.post('/documents', {
      docCode: docCode.value.trim().toUpperCase(),
      projectId: props.projectId,
      companyId: auth.user?.companyId,
      fileId,
      type: 'file',
      ...(props.parentDocumentId ? { parentDocumentId: props.parentDocumentId } : {}),
      documentField,
    })

    toast.success('Document uploaded successfully')
    cancelBack()
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Upload failed')
  } finally {
    uploading.value = false
    progress.value = 0
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-6 max-w-2xl">
    <!-- Doc Code -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium text-gray-700">Document Code <span class="text-red-500">*</span></label>
      <input v-model="docCode" placeholder="e.g. DWG-ARCH-001" required
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 uppercase" />
      <p class="text-xs text-gray-400">Unique code for this document within the project.</p>
    </div>

    <!-- File picker -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium text-gray-700">File <span class="text-red-500">*</span></label>
      <input type="file" @change="onFile" required
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
    </div>

    <!-- Project fields -->
    <div v-for="f in fields" :key="f.id" class="space-y-1.5">
      <label class="text-sm font-medium text-gray-700">
        {{ f.fieldText }}<span v-if="f.mandatory" class="text-red-500 ml-0.5">*</span>
      </label>
      <select v-if="f.type === 'select'" v-model="fieldValues[f.fieldCode]" :required="f.mandatory"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400">
        <option value="">— Select —</option>
        <option v-for="opt in (f.options ?? [])" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      <textarea v-else-if="f.type === 'textarea'" v-model="fieldValues[f.fieldCode]" :required="f.mandatory" rows="3"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
      <input v-else v-model="fieldValues[f.fieldCode]"
        :type="f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'"
        :required="f.mandatory"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400" />
    </div>

    <!-- Upload progress -->
    <div v-if="uploading" class="space-y-1">
      <div class="w-full bg-gray-100 rounded-full h-1.5">
        <div class="bg-gray-900 h-1.5 rounded-full transition-all" :style="{ width: `${progress}%` }" />
      </div>
      <p class="text-xs text-gray-400 text-right">{{ progress }}%</p>
    </div>

    <div class="flex gap-3">
      <button type="button" @click="cancelBack"
        class="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
      <button type="submit" :disabled="uploading"
        class="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
        {{ uploading ? 'Uploading…' : 'Upload' }}
      </button>
    </div>
  </form>
</template>
