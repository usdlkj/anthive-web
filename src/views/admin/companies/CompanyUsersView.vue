<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserTable from '@/components/tables/UserTable.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import axiosInstance from '@/lib/axios'
import type { User } from '@/interfaces/User'

const route = useRoute()
const router = useRouter()
const companyId = route.params.id as string
const users = ref<User[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axiosInstance.get(`/companies/${companyId}/users`)
    users.value = res.data?.data ?? res.data ?? []
  } catch { users.value = [] }
  finally { loading.value = false }
})
</script>

<template>
  <PageWrapper title="Company Users">
    <template #breadcrumb>
      <button @click="router.back()" class="text-m-muted hover:text-nav-active transition-colors">← Companies</button>
    </template>
    <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>
    <UserTable v-else :initial-data="users" :company-id="companyId" />
  </PageWrapper>
</template>
