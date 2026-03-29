<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, FileText, Loader2, FolderSearch } from 'lucide-vue-next'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import type { Document } from '@/interfaces/Document'

interface SearchResult extends Document {
  score: number
}

const router = useRouter()
const auth = useAuthStore()

const query = ref('')
const results = ref<SearchResult[]>([])
const searching = ref(false)
const searched = ref(false)
const errorMsg = ref('')

const projectId = computed(() => auth.user?.currentProjectId ?? '')
const companyId = computed(() => auth.user?.companyId ?? '')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!query.value.trim()) {
    results.value = []
    searched.value = false
    return
  }
  debounceTimer = setTimeout(runSearch, 500)
}

async function runSearch() {
  const q = query.value.trim()
  if (!q || !projectId.value || !companyId.value) return

  searching.value = true
  errorMsg.value = ''
  searched.value = true

  try {
    const res = await axiosInstance.get('/api/documents/search', {
      params: { q, projectId: projectId.value, companyId: companyId.value, limit: 20 },
    })
    results.value = res.data?.data ?? []
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'Search failed'
    results.value = []
  } finally {
    searching.value = false
  }
}

function openDocument(doc: SearchResult) {
  router.push({ path: '/documents', query: { parentId: doc.parentId ?? 'root' } })
}

function scorePercent(score: number) {
  return Math.round(Math.max(0, Math.min(1, score)) * 100)
}

function scoreClass(score: number) {
  const pct = scorePercent(score)
  if (pct >= 80) return 'bg-green-100 text-green-700 border-green-200'
  if (pct >= 60) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (pct >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-sidebar-panel text-m-muted border-sidebar-border'
}
</script>

<template>
  <PageWrapper title="AI Search">

    <!-- Search input -->
    <div class="max-w-2xl mb-6">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-m-muted pointer-events-none" />
        <input
          v-model="query"
          @input="onInput"
          type="text"
          placeholder="Search documents by meaning… e.g. 'structural drawings revised in 2024'"
          class="w-full pl-9 pr-4 py-2.5 border border-sidebar-border rounded text-[13px] text-body-text
                 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors"
        />
        <Loader2
          v-if="searching"
          class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-m-muted animate-spin"
        />
      </div>
      <p v-if="!projectId" class="mt-2 text-[12px] text-yellow-600">
        Select a project first to enable search.
      </p>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded text-[13px] text-red-600">
      {{ errorMsg }}
    </div>

    <!-- Pre-search instruction -->
    <div v-if="!searched && !searching" class="flex flex-col items-center justify-center py-16 text-center">
      <FolderSearch class="w-12 h-12 text-icon-default mb-4" />
      <p class="text-[14px] font-medium text-heading mb-1">Semantic Document Search</p>
      <p class="text-[13px] text-m-muted max-w-sm">
        Type a natural language query above. Results are ranked by meaning, not just keywords.
      </p>
    </div>

    <!-- No results -->
    <div v-else-if="searched && !searching && results.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
      <FileText class="w-12 h-12 text-icon-default mb-4" />
      <p class="text-[14px] font-medium text-heading mb-1">No results found</p>
      <p class="text-[13px] text-m-muted">Try a different query, or upload and wait for documents to be indexed.</p>
    </div>

    <!-- Results list -->
    <div v-else-if="results.length > 0" class="space-y-3">
      <p class="text-[12px] text-m-muted mb-2">{{ results.length }} result{{ results.length !== 1 ? 's' : '' }} for "{{ query }}"</p>

      <div
        v-for="doc in results"
        :key="doc.id"
        class="bg-white border border-sidebar-border rounded-lg p-4 hover:border-brand/40 transition-colors cursor-pointer group"
        @click="openDocument(doc)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-2 min-w-0">
            <FileText class="w-4 h-4 text-m-muted flex-shrink-0" />
            <span class="font-mono text-[13px] font-medium text-heading truncate">{{ doc.docCode }}</span>
            <span class="text-[11px] text-m-muted flex-shrink-0">v{{ doc.version }}</span>
          </div>
          <span
            class="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded border"
            :class="scoreClass(doc.score)"
          >
            {{ scorePercent(doc.score) }}% match
          </span>
        </div>

        <!-- AI Summary -->
        <p v-if="doc.aiSummary" class="mt-2 text-[13px] text-nav-text line-clamp-3 leading-relaxed">
          {{ doc.aiSummary }}
        </p>
        <p v-else class="mt-2 text-[13px] text-m-muted italic">No summary available</p>

        <!-- Metadata chips -->
        <div class="mt-3 flex flex-wrap gap-2">
          <template v-for="(value, key) in doc.fieldMap" :key="key">
            <span v-if="value" class="text-[11px] px-2 py-0.5 bg-sidebar-panel border border-sidebar-border rounded text-m-muted">
              {{ key }}: {{ value }}
            </span>
          </template>
          <span
            class="text-[11px] px-2 py-0.5 bg-sidebar-panel border border-sidebar-border rounded text-m-muted group-hover:text-nav-active"
          >
            View in Documents →
          </span>
        </div>
      </div>
    </div>

  </PageWrapper>
</template>
