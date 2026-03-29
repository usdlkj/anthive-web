<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SummaryCard from '@/components/SummaryCard.vue'
import CapacityBanner from '@/components/ui/CapacityBanner.vue'
import PageWrapper from '@/components/ui/PageWrapper.vue'
import axiosInstance from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isAnthive = computed(() => auth.isAnthiveTeam)

// ── Client team state ────────────────────────────────────────
const docCount = ref<number | string>('…')
const projCount = ref<number | string>('…')

// ── Anthive team state ───────────────────────────────────────
interface CapacityStatus {
  limit: number
  used: number
  percent: number
  breachedThreshold: 50 | 80 | 95 | null
  severity: 'ok' | 'warning' | 'high' | 'critical'
}
interface SystemStats { totalDocuments: number; capacity: CapacityStatus }
interface Alert { id: string; threshold: 50 | 80 | 95; documentCount: number; createdAt: string }

const stats = ref<SystemStats | null>(null)
const alerts = ref<Alert[]>([])

onMounted(async () => {
  if (isAnthive.value) {
    const [s, a] = await Promise.allSettled([
      axiosInstance.get('/api/admin/stats'),
      axiosInstance.get('/api/admin/alerts'),
    ])
    if (s.status === 'fulfilled') stats.value = s.value.data
    if (a.status === 'fulfilled') alerts.value = a.value.data ?? []
  } else {
    const [d, p] = await Promise.allSettled([
      axiosInstance.get('/api/documents', { params: { companyId: auth.user?.companyId, pageSize: 1 } }),
      axiosInstance.get('/api/projects'),
    ])
    docCount.value = d.status === 'fulfilled' ? (d.value.data?.meta?.total ?? d.value.data?.total ?? d.value.data?.data?.length ?? 0) : '-'
    projCount.value = p.status === 'fulfilled' ? (p.value.data?.total ?? (Array.isArray(p.value.data) ? p.value.data.length : 0)) : '-'
  }
})

function dismissAlert(id: string) {
  alerts.value = alerts.value.filter((a) => a.id !== id)
}

// Gauge helpers
const gaugePercent = computed(() => Math.min(stats.value?.capacity.percent ?? 0, 100))

const gaugeColor = computed(() => {
  const s = stats.value?.capacity.severity
  if (s === 'critical') return 'bg-red-500'
  if (s === 'high') return 'bg-orange-500'
  if (s === 'warning') return 'bg-yellow-400'
  return 'bg-brand'
})

const gaugeTextColor = computed(() => {
  const s = stats.value?.capacity.severity
  if (s === 'critical') return 'text-red-600'
  if (s === 'high') return 'text-orange-600'
  if (s === 'warning') return 'text-yellow-600'
  return 'text-brand'
})

function fmtNum(n: number | undefined) {
  return n?.toLocaleString() ?? '…'
}
</script>

<template>
  <PageWrapper title="Dashboard">
    <template #breadcrumb>
      <span class="text-m-muted">Welcome, {{ auth.user?.name }}</span>
    </template>

    <!-- ── Anthive team: system-wide view ── -->
    <template v-if="isAnthive">

      <!-- Capacity threshold alerts -->
      <div v-if="alerts.length" class="mb-4">
        <CapacityBanner
          v-for="alert in alerts"
          :key="alert.id"
          :alert="alert"
          @dismissed="dismissAlert"
        />
      </div>

      <!-- Summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Total Documents"
          :value="stats ? fmtNum(stats.totalDocuments) : '…'"
          description="System-wide live documents"
        />
        <SummaryCard
          title="pgvector Capacity"
          :value="stats ? `${stats.capacity.percent}%` : '…'"
          description="of 500,000 document limit"
        />
        <SummaryCard
          title="Role"
          :value="auth.user?.role ?? '-'"
          description="Your access level"
        />
      </div>

      <!-- Capacity progress bar -->
      <div v-if="stats" class="bg-white border border-sidebar-border rounded-lg p-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-[13px] font-medium text-nav-text">pgvector Document Capacity</p>
          <p class="text-[13px]" :class="gaugeTextColor">
            <span class="font-semibold">{{ fmtNum(stats.capacity.used) }}</span>
            <span class="text-m-muted"> / {{ fmtNum(stats.capacity.limit) }}</span>
          </p>
        </div>

        <!-- Bar track -->
        <div class="w-full h-2.5 bg-sidebar-panel rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="gaugeColor"
            :style="{ width: `${gaugePercent}%` }"
          />
        </div>

        <!-- Threshold tick marks -->
        <div class="relative mt-1 h-3">
          <span
            v-for="pct in [50, 80, 95]"
            :key="pct"
            class="absolute top-0 text-[10px] text-m-muted -translate-x-1/2"
            :style="{ left: `${pct}%` }"
          >{{ pct }}%</span>
        </div>

        <p v-if="stats.capacity.severity !== 'ok'" class="mt-3 text-[12px]" :class="gaugeTextColor">
          <template v-if="stats.capacity.severity === 'critical'">
            Critical: approaching pgvector limit. Immediate migration to Qdrant or Pinecone is recommended.
          </template>
          <template v-else-if="stats.capacity.severity === 'high'">
            High: plan migration to a dedicated vector store (Qdrant or Pinecone) soon.
          </template>
          <template v-else>
            Monitor growth. Migration planning recommended above 80%.
          </template>
        </p>
        <p v-else class="mt-2 text-[12px] text-m-muted">
          Document count is within healthy range.
        </p>
      </div>

    </template>

    <!-- ── Client team: company-scoped view ── -->
    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard title="Documents" :value="docCount" description="In your company" />
        <SummaryCard title="Projects" :value="projCount" description="Available projects" />
        <SummaryCard title="Role" :value="auth.user?.role ?? '-'" description="Your access level" />
      </div>
    </template>

  </PageWrapper>
</template>
