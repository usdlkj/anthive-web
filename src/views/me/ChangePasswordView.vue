<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import axiosInstance from '@/lib/axios'
import PageWrapper from '@/components/ui/PageWrapper.vue'

const form = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const saving = ref(false)

async function submit() {
  if (form.value.newPassword !== form.value.confirmPassword) { toast.error('Passwords do not match'); return }
  saving.value = true
  try {
    await axiosInstance.patch('/auth/change-password', { currentPassword: form.value.currentPassword, newPassword: form.value.newPassword })
    toast.success('Password changed')
    form.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Failed to change password')
  } finally { saving.value = false }
}
</script>

<template>
  <PageWrapper title="Change Password" breadcrumb="Profile / Change Password">
    <div class="max-w-lg">
      <div class="bg-white border border-sidebar-border rounded-lg overflow-hidden">
        <!-- Card header -->
        <div class="px-5 py-4 border-b border-sidebar-border bg-sidebar-panel">
          <h5 class="text-[14px] font-medium text-heading m-0">Update Password</h5>
        </div>
        <!-- Card body -->
        <div class="px-5 py-5">
          <form @submit.prevent="submit" class="space-y-4">
            <div>
              <label class="block text-[13px] font-medium text-nav-text mb-1">Current Password</label>
              <input
                v-model="form.currentPassword"
                type="password"
                required
                class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
              />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-nav-text mb-1">New Password</label>
              <input
                v-model="form.newPassword"
                type="password"
                required
                minlength="8"
                class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
              />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-nav-text mb-1">Confirm New Password</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                required
                class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
              />
            </div>
            <div class="pt-1">
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-brand hover:bg-brand-light text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Updating…' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>
