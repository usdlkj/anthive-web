<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import AppDialog from '@/components/ui/AppDialog.vue'
import axiosInstance from '@/lib/axios'
import type { User } from '@/interfaces/User'

const props = defineProps<{ open: boolean; data: User | null; companyId: string }>()
const emit = defineEmits<{ close: []; saved: [u: User] }>()

const form = ref({ name: '', email: '', phoneNumber: '', role: 'user', status: 'active', password: '' })
const saving = ref(false)

watch(() => props.data, v => {
  form.value = v
    ? { name: v.name, email: v.email, phoneNumber: v.phoneNumber, role: v.role, status: v.status, password: '' }
    : { name: '', email: '', phoneNumber: '', role: 'user', status: 'active', password: '' }
}, { immediate: true })

async function submit() {
  saving.value = true
  try {
    let res
    if (props.data?.id) {
      const payload: any = { name: form.value.name, email: form.value.email, phoneNumber: form.value.phoneNumber, role: form.value.role, status: form.value.status }
      if (form.value.password) payload.password = form.value.password
      res = await axiosInstance.patch(`/users/${props.data.id}`, payload)
    } else {
      res = await axiosInstance.post('/users', { ...form.value, companyId: props.companyId })
    }
    toast.success(props.data?.id ? 'Updated' : 'Created')
    emit('saved', res.data)
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Save failed')
  } finally { saving.value = false }
}
</script>

<template>
  <AppDialog :open="open" :title="data?.id ? 'Edit User' : 'New User'" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Name *</label>
          <input v-model="form.name" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Email *</label>
          <input v-model="form.email" type="email" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Phone</label>
          <input v-model="form.phoneNumber" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Role</label>
          <select v-model="form.role" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors">
            <option value="super_admin">Super Admin</option>
            <option value="ops_admin">Ops Admin</option>
            <option value="company_admin">Company Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Status</label>
          <select v-model="form.status" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors">
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Password {{ data?.id ? '(blank = keep)' : '*' }}</label>
          <input v-model="form.password" type="password" :required="!data?.id" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" @click="emit('close')" class="px-4 py-2 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text">Cancel</button>
        <button type="submit" :disabled="saving" class="px-4 py-2 text-[13px] bg-brand hover:bg-brand-light text-white rounded transition-colors disabled:opacity-50">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </AppDialog>
</template>
