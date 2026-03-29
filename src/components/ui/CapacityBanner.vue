<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'
import axiosInstance from '@/lib/axios'

interface Alert {
  id: string
  threshold: 50 | 80 | 95
  documentCount: number
  createdAt: string
}

const props = defineProps<{ alert: Alert }>()
const emit = defineEmits<{ dismissed: [id: string] }>()

const config: Record<number, { label: string; classes: string; iconClass: string }> = {
  50: {
    label: 'Warning',
    classes: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    iconClass: 'text-yellow-500',
  },
  80: {
    label: 'High',
    classes: 'bg-orange-50 border-orange-300 text-orange-800',
    iconClass: 'text-orange-500',
  },
  95: {
    label: 'Critical',
    classes: 'bg-red-50 border-red-300 text-red-800',
    iconClass: 'text-red-500',
  },
}

const style = config[props.alert.threshold] ?? config[50]

async function acknowledge() {
  try {
    await axiosInstance.patch(`/api/admin/alerts/${props.alert.id}/acknowledge`)
    emit('dismissed', props.alert.id)
  } catch {
    // Dismiss locally even on error to avoid blocking the UI
    emit('dismissed', props.alert.id)
  }
}

function formatCount(n: number) {
  return n.toLocaleString()
}
</script>

<template>
  <div
    class="flex items-start gap-3 px-4 py-3 border rounded-lg mb-3"
    :class="style.classes"
  >
    <AlertTriangle class="w-4 h-4 mt-0.5 flex-shrink-0" :class="style.iconClass" />

    <div class="flex-1 min-w-0 text-[13px]">
      <span class="font-semibold">{{ style.label }}:</span>
      Document count has reached
      <span class="font-semibold">{{ alert.threshold }}%</span>
      of the 500,000 pgvector capacity limit
      <span class="text-[12px] opacity-70">
        ({{ formatCount(alert.documentCount) }} documents)
      </span>.
      <span v-if="alert.threshold >= 80" class="ml-1">
        Consider migrating to a dedicated vector store (Qdrant or Pinecone).
      </span>
    </div>

    <button
      @click="acknowledge"
      class="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
      title="Acknowledge and dismiss"
    >
      <X class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
