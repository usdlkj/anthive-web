<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectFieldTable from '@/components/tables/ProjectFieldTable.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import axiosInstance from '@/lib/axios'
import type { ProjectField } from '@/interfaces/ProjectField'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId as string
const fields = ref<ProjectField[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axiosInstance.get('/project-fields', { params: { projectId } })
    fields.value = res.data?.data ?? res.data ?? []
  } catch { fields.value = [] }
  finally { loading.value = false }
})
</script>

<template>
  <PageWrapper title="Project Fields">
    <template #breadcrumb>
      <button @click="router.back()" class="text-m-muted hover:text-nav-active transition-colors">← Projects</button>
    </template>
    <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>
    <ProjectFieldTable v-else :initial-data="fields" :project-id="projectId" />
  </PageWrapper>
</template>
