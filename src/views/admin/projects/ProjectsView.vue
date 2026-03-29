<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProjectTable from '@/components/tables/ProjectTable.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import axiosInstance from '@/lib/axios'
import type { Project } from '@/interfaces/Project'

const projects = ref<Project[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axiosInstance.get('/projects')
    projects.value = res.data?.data ?? res.data ?? []
  } catch { projects.value = [] }
  finally { loading.value = false }
})
</script>

<template>
  <PageWrapper title="Projects" breadcrumb="Administration / Projects">
    <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>
    <ProjectTable v-else :initial-data="projects" />
  </PageWrapper>
</template>
