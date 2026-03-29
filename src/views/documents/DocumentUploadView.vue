<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DocumentFormClient from '@/components/documents/DocumentFormClient.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import type { ProjectField } from '@/interfaces/ProjectField'

const route = useRoute()
const auth = useAuthStore()
const fields = ref<ProjectField[]>([])
const loading = ref(true)

// parentId may come from query param when navigating from inside a folder
const parentDocumentId = route.query.parentId as string | undefined

onMounted(async () => {
  if (auth.user?.currentProjectId) {
    try {
      const res = await axiosInstance.get('/project-fields', {
        params: { projectId: auth.user.currentProjectId },
      })
      fields.value = res.data?.data ?? res.data ?? []
    } catch {
      fields.value = []
    }
  }
  loading.value = false
})
</script>

<template>
  <PageWrapper title="Upload Document" breadcrumb="Documents / Upload">
    <div v-if="loading" class="py-16 text-center text-m-muted text-[13px]">Loading…</div>
    <div
      v-else-if="!auth.user?.currentProjectId"
      class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[13px] text-amber-800"
    >
      Please select a project from the top bar first.
    </div>
    <DocumentFormClient
      v-else
      :fields="fields"
      :project-id="auth.user.currentProjectId"
      :parent-document-id="parentDocumentId"
    />
  </PageWrapper>
</template>
