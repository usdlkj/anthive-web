<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import AppDialog from '@/components/ui/AppDialog.vue'
import axiosInstance from '@/lib/axios'
import type { Project } from '@/interfaces/Project'

const props = defineProps<{ open: boolean; data: Project | null }>()
const emit = defineEmits<{ close: []; saved: [p: Project] }>()

const form = ref({ projectCode: '', projectName: '', description: '' })
const saving = ref(false)

watch(() => props.data, v => {
  form.value = v ? { projectCode: v.projectCode, projectName: v.projectName, description: v.description ?? '' } : { projectCode: '', projectName: '', description: '' }
}, { immediate: true })

async function submit() {
  saving.value = true
  try {
    const res = props.data?.id
      ? await axiosInstance.patch(`/projects/${props.data.id}`, form.value)
      : await axiosInstance.post('/projects', form.value)
    toast.success(props.data?.id ? 'Updated' : 'Created')
    emit('saved', res.data)
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Save failed')
  } finally { saving.value = false }
}
</script>

<template>
  <AppDialog :open="open" :title="data?.id ? 'Edit Project' : 'New Project'" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="space-y-1.5">
        <label class="text-[13px] font-medium text-nav-text">Project Code *</label>
        <input v-model="form.projectCode" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
      </div>
      <div class="space-y-1.5">
        <label class="text-[13px] font-medium text-nav-text">Project Name *</label>
        <input v-model="form.projectName" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
      </div>
      <div class="space-y-1.5">
        <label class="text-[13px] font-medium text-nav-text">Description</label>
        <textarea v-model="form.description" rows="3" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" @click="emit('close')" class="px-4 py-2 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text">Cancel</button>
        <button type="submit" :disabled="saving" class="px-4 py-2 text-[13px] bg-brand hover:bg-brand-light text-white rounded transition-colors disabled:opacity-50">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </AppDialog>
</template>
