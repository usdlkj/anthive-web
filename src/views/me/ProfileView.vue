<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import PageWrapper from '@/components/ui/PageWrapper.vue'

const auth = useAuthStore()
const form = ref({ name: auth.user?.name ?? '', phoneNumber: auth.user?.phoneNumber ?? '' })
const saving = ref(false)

watch(() => auth.user, u => { if (u) form.value = { name: u.name, phoneNumber: u.phoneNumber } })

async function submit() {
  if (!auth.user?.id) return
  saving.value = true
  try {
    await axiosInstance.patch(`/users/${auth.user.id}`, form.value)
    await auth.fetchMe()
    toast.success('Profile updated')
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Update failed')
  } finally { saving.value = false }
}
</script>

<template>
  <PageWrapper title="My Profile" breadcrumb="Profile">
    <div class="max-w-lg">
      <div class="bg-white border border-sidebar-border rounded-lg overflow-hidden">
        <!-- Card header -->
        <div class="px-5 py-4 border-b border-sidebar-border bg-sidebar-panel">
          <h5 class="text-[14px] font-medium text-heading m-0">Account Information</h5>
        </div>
        <!-- Card body -->
        <div class="px-5 py-5 space-y-4">
          <!-- Read-only email -->
          <div>
            <p class="text-[11px] font-semibold text-m-muted uppercase tracking-wide mb-1">Email</p>
            <p class="text-[13px] text-body-text">{{ auth.user?.email }}</p>
          </div>
          <hr class="border-sidebar-border" />
          <form @submit.prevent="submit" class="space-y-4">
            <div>
              <label class="block text-[13px] font-medium text-nav-text mb-1">Name</label>
              <input
                v-model="form.name"
                required
                class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
              />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-nav-text mb-1">Phone</label>
              <input
                v-model="form.phoneNumber"
                class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
              />
            </div>
            <div class="pt-1">
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-brand hover:bg-brand-light text-white text-[13px] font-medium rounded transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>
