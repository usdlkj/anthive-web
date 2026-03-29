<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectMemberTable from '@/components/tables/ProjectMemberTable.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import axiosInstance from '@/lib/axios'
import type { ProjectMember } from '@/interfaces/ProjectMember'

const route = useRoute()
const router = useRouter()
const projectId = route.params.projectId as string
const members = ref<ProjectMember[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await axiosInstance.get('/project-members', { params: { projectId } })
    members.value = res.data?.data ?? res.data ?? []
  } catch { members.value = [] }
  finally { loading.value = false }
})
</script>

<template>
  <PageWrapper title="Project Members">
    <template #breadcrumb>
      <button @click="router.back()" class="text-m-muted hover:text-nav-active transition-colors">← Projects</button>
    </template>
    <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>
    <ProjectMemberTable v-else :initial-data="members" :project-id="projectId" />
  </PageWrapper>
</template>
