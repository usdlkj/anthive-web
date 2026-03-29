<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { toast } from 'vue-sonner'
import AppDialog from '@/components/ui/AppDialog.vue'
import axiosInstance from '@/lib/axios'
import type { ProjectField } from '@/interfaces/ProjectField'

const props = defineProps<{ open: boolean; data: ProjectField | null; projectId: string }>()
const emit = defineEmits<{ close: []; saved: [f: ProjectField] }>()

const form = ref({ fieldCode: '', fieldText: '', type: 'text' as ProjectField['type'], visible: true, mandatory: false, sequence: 1, optionsText: '' })
const saving = ref(false)
const showOptions = computed(() => form.value.type === 'select')

watch(() => props.data, v => {
  form.value = v
    ? { fieldCode: v.fieldCode, fieldText: v.fieldText, type: v.type, visible: v.visible, mandatory: v.mandatory, sequence: v.sequence, optionsText: (v.options ?? []).join('\n') }
    : { fieldCode: '', fieldText: '', type: 'text', visible: true, mandatory: false, sequence: 1, optionsText: '' }
}, { immediate: true })

async function submit() {
  saving.value = true
  try {
    const payload: any = { fieldCode: form.value.fieldCode, fieldText: form.value.fieldText, type: form.value.type, visible: form.value.visible, mandatory: form.value.mandatory, sequence: form.value.sequence, projectId: props.projectId }
    if (showOptions.value) payload.options = form.value.optionsText.split('\n').map(s => s.trim()).filter(Boolean)
    const res = props.data?.id
      ? await axiosInstance.patch(`/project-fields/${props.data.id}`, payload)
      : await axiosInstance.post('/project-fields', payload)
    toast.success(props.data?.id ? 'Updated' : 'Created')
    emit('saved', res.data)
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Save failed')
  } finally { saving.value = false }
}
</script>

<template>
  <AppDialog :open="open" :title="data?.id ? 'Edit Field' : 'New Field'" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Field Code *</label>
          <input v-model="form.fieldCode" required :disabled="!!data?.isSystem" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors disabled:opacity-50 disabled:bg-sidebar-panel" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Label *</label>
          <input v-model="form.fieldText" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Type</label>
          <select v-model="form.type" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors">
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Sequence</label>
          <input v-model.number="form.sequence" type="number" min="1" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="col-span-2 flex items-center gap-6">
          <label class="flex items-center gap-2 text-[13px] text-nav-text cursor-pointer">
            <input type="checkbox" v-model="form.visible" class="rounded accent-brand" /> Visible
          </label>
          <label class="flex items-center gap-2 text-[13px] text-nav-text cursor-pointer">
            <input type="checkbox" v-model="form.mandatory" class="rounded accent-brand" /> Required
          </label>
        </div>
        <div v-if="showOptions" class="col-span-2 space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Options (one per line)</label>
          <textarea v-model="form.optionsText" rows="4" placeholder="Option A&#10;Option B&#10;Option C"
            class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" @click="emit('close')" class="px-4 py-2 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text">Cancel</button>
        <button type="submit" :disabled="saving" class="px-4 py-2 text-[13px] bg-brand hover:bg-brand-light text-white rounded transition-colors disabled:opacity-50">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </AppDialog>
</template>
