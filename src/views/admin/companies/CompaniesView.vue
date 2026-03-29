<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CompanyTable from '@/components/tables/CompanyTable.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import axiosInstance from '@/lib/axios'
import type { Company } from '@/interfaces/Company'

const companies = ref<Company[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axiosInstance.get('/companies')
    companies.value = res.data?.data ?? res.data ?? []
  } catch { companies.value = [] }
  finally { loading.value = false }
})
</script>

<template>
  <PageWrapper title="Companies" breadcrumb="Administration / Companies">
    <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>
    <CompanyTable v-else :initial-data="companies" />
  </PageWrapper>
</template>
