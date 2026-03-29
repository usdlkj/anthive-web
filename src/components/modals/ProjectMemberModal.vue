<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import AppDialog from '@/components/ui/AppDialog.vue'
import axiosInstance from '@/lib/axios'
import type { ProjectMember } from '@/interfaces/ProjectMember'
import type { User } from '@/interfaces/User'

const props = defineProps<{ open: boolean; projectId: string }>()
const emit = defineEmits<{ close: []; saved: [m: ProjectMember] }>()

const users = ref<User[]>([])
const selectedUserId = ref('')
const saving = ref(false)

watch(() => props.open, async (v) => {
  if (v && users.value.length === 0) {
    try {
      const res = await axiosInstance.get('/users')
      users.value = res.data?.data ?? res.data ?? []
    } catch { users.value = [] }
  }
})

async function submit() {
  if (!selectedUserId.value) { toast.error('Select a user'); return }
  saving.value = true
  try {
    const res = await axiosInstance.post('/project-members', { projectId: props.projectId, userId: selectedUserId.value })
    toast.success('Member added')
    emit('saved', res.data)
    selectedUserId.value = ''
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Failed')
  } finally { saving.value = false }
}
</script>

<template>
  <AppDialog :open="open" title="Add Member" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="space-y-1.5">
        <label class="text-[13px] font-medium text-nav-text">User *</label>
        <select v-model="selectedUserId" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors">
          <option value="">Select a user…</option>
          <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
        </select>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" @click="emit('close')" class="px-4 py-2 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text">Cancel</button>
        <button type="submit" :disabled="saving" class="px-4 py-2 text-[13px] bg-brand hover:bg-brand-light text-white rounded transition-colors disabled:opacity-50">{{ saving ? 'Adding…' : 'Add' }}</button>
      </div>
    </form>
  </AppDialog>
</template>
