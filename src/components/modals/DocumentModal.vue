<script setup lang="ts">
import AppDialog from '@/components/ui/AppDialog.vue'
import { formatWibDate } from '@/lib/formatters'
import type { Document } from '@/interfaces/Document'
import type { ProjectField } from '@/interfaces/ProjectField'

const props = defineProps<{ open: boolean; data: Document | null; fields: ProjectField[] }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppDialog :open="open" :title="data?.docCode ?? 'Document'" @close="emit('close')">
    <div v-if="data" class="space-y-4">
      <div class="grid grid-cols-2 gap-3 text-[13px]">
        <div><p class="text-[11px] text-m-muted uppercase tracking-wide mb-1">Doc Code</p><p class="font-mono font-medium text-body-text">{{ data.docCode }}</p></div>
        <div><p class="text-[11px] text-m-muted uppercase tracking-wide mb-1">Version</p><p class="font-medium text-body-text">v{{ data.version }}</p></div>
        <div><p class="text-[11px] text-m-muted uppercase tracking-wide mb-1">File</p><p class="text-nav-text">{{ data.fileName ?? '-' }}</p></div>
        <div><p class="text-[11px] text-m-muted uppercase tracking-wide mb-1">Created</p><p class="text-nav-text">{{ formatWibDate(data.createdAt) }}</p></div>
        <template v-for="f in fields.filter(x => x.visible)" :key="f.id">
          <div><p class="text-[11px] text-m-muted uppercase tracking-wide mb-1">{{ f.fieldText }}</p><p class="text-nav-text">{{ data.fieldMap?.[f.fieldCode] ?? '-' }}</p></div>
        </template>
      </div>
      <div class="flex justify-end pt-2">
        <button @click="emit('close')" class="px-4 py-2 text-[13px] border border-sidebar-border rounded hover:bg-sidebar-panel transition-colors text-nav-text">Close</button>
      </div>
    </div>
  </AppDialog>
</template>
