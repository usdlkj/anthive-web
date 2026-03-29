<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import AppDialog from '@/components/ui/AppDialog.vue'
import axiosInstance from '@/lib/axios'
import type { Company } from '@/interfaces/Company'

const props = defineProps<{ open: boolean; data: Company | null }>()
const emit = defineEmits<{ close: []; saved: [c: Company] }>()

const form = ref({ companyCode: '', companyName: '', tradingName: '', address: '', email: '', phoneNumber: '' })
const adminForm = ref({ name: '', email: '', password: '', phoneNumber: '' })
const saving = ref(false)

watch(() => props.data, v => {
  form.value = v
    ? { companyCode: v.companyCode, companyName: v.companyName, tradingName: v.tradingName, address: v.address, email: v.email, phoneNumber: v.phoneNumber }
    : { companyCode: '', companyName: '', tradingName: '', address: '', email: '', phoneNumber: '' }
  adminForm.value = { name: '', email: '', password: '', phoneNumber: '' }
}, { immediate: true })

async function submit() {
  saving.value = true
  try {
    const res = props.data?.id
      ? await axiosInstance.patch(`/companies/${props.data.id}`, form.value)
      : await axiosInstance.post('/companies', form.value)

    if (!props.data?.id) {
      // Create the company admin user
      await axiosInstance.post('/users', {
        ...adminForm.value,
        companyId: res.data.id,
        role: 'company_admin',
      })
    }

    toast.success(props.data?.id ? 'Updated' : 'Company and admin user created')
    emit('saved', res.data)
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Save failed')
  } finally { saving.value = false }
}
</script>

<template>
  <AppDialog :open="open" :title="data?.id ? 'Edit Company' : 'New Company'" @close="emit('close')">
    <form @submit.prevent="submit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Code *</label>
          <input v-model="form.companyCode" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Company Name *</label>
          <input v-model="form.companyName" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Trading Name</label>
          <input v-model="form.tradingName" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Email</label>
          <input v-model="form.email" type="email" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-nav-text">Phone</label>
          <input v-model="form.phoneNumber" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
        <div class="space-y-1.5 col-span-2">
          <label class="text-[13px] font-medium text-nav-text">Address</label>
          <textarea v-model="form.address" rows="2" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
        </div>
      </div>

      <template v-if="!data?.id">
          <div class="border-t border-sidebar-border pt-4">
          <p class="text-[13px] font-semibold text-heading mb-3">Company Admin User</p>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[13px] font-medium text-nav-text">Full Name *</label>
              <input v-model="adminForm.name" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[13px] font-medium text-nav-text">Email *</label>
              <input v-model="adminForm.email" type="email" required class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[13px] font-medium text-nav-text">Password *</label>
              <input v-model="adminForm.password" type="password" required minlength="8" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
            </div>
            <div class="space-y-1.5">
              <label class="text-[13px] font-medium text-nav-text">Phone</label>
              <input v-model="adminForm.phoneNumber" class="w-full border border-sidebar-border rounded px-3 py-2 text-[13px] text-body-text focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors" />
            </div>
          </div>
        </div>
      </template>

      <div class="flex justify-end gap-2 pt-2">
        <button type="button" @click="emit('close')" class="px-4 py-2 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text">Cancel</button>
        <button type="submit" :disabled="saving" class="px-4 py-2 text-[13px] bg-brand hover:bg-brand-light text-white rounded transition-colors disabled:opacity-50">{{ saving ? 'Saving…' : 'Save' }}</button>
      </div>
    </form>
  </AppDialog>
</template>
