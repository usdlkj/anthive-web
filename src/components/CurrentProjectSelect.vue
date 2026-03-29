<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/lib/axios'
import type { Project } from '@/interfaces/Project'

const auth = useAuthStore()
const projects = ref<Project[]>([])

onMounted(async () => {
  try {
    const res = await axiosInstance.get('/projects/my')
    projects.value = res.data?.data ?? res.data ?? []
  } catch {
    projects.value = []
  }
})

async function onChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value || null
  await auth.updateCurrentProject(val)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-xs text-gray-400 font-medium uppercase tracking-wide">Project</span>
    <select :value="auth.user?.currentProjectId ?? ''" @change="onChange"
      class="text-sm border border-gray-200 rounded-md px-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 max-w-64">
      <option value="">— Select —</option>
      <option v-for="p in projects" :key="p.id" :value="p.id">
        {{ p.projectCode }} · {{ p.projectName }}
      </option>
    </select>
  </div>
</template>
