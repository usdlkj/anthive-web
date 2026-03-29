<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Folder, FileText, Lock } from 'lucide-vue-next'
import BackofficeDataTable from '@/components/tables/BackofficeDataTable.vue'
import DocumentModal from '@/components/modals/DocumentModal.vue'
import { formatWibDate } from '@/lib/formatters'
import type { Document } from '@/interfaces/Document'
import type { ProjectField } from '@/interfaces/ProjectField'

const props = defineProps<{ documents: Document[]; projectFields: ProjectField[] }>()
const emit = defineEmits<{ navigate: [folder: Document] }>()

const visible = computed(() => props.projectFields.filter(f => f.visible))

const modalOpen = ref(false)
const selected = ref<Document | null>(null)

const columns = computed(() => [
  { key: '_icon', label: '' },
  { key: 'docCode', label: 'Doc Code' },
  ...visible.value.map(f => ({ key: f.fieldCode, label: f.fieldText })),
  { key: 'version', label: 'Ver' },
  { key: 'createdAt', label: 'Date' },
  { key: 'actions', label: '' },
])

function openDoc(doc: Document) {
  if (doc.type === 'folder') {
    emit('navigate', doc)
  } else {
    selected.value = doc
    modalOpen.value = true
  }
}
</script>

<template>
  <div>
    <BackofficeDataTable :data="documents as any" :columns="columns">
      <template #row="{ row }">
        <!-- Type icon -->
        <td class="pl-4 pr-2 py-3 w-8">
          <Folder v-if="(row as Document).type === 'folder'" class="w-4 h-4 text-amber-400" />
          <FileText v-else class="w-4 h-4 text-gray-400" />
        </td>

        <!-- Doc code — clickable for folders -->
        <td class="px-4 py-3">
          <div class="flex items-center gap-1.5">
            <button v-if="(row as Document).type === 'folder'"
              class="font-mono text-xs font-semibold text-gray-800 hover:text-amber-600 hover:underline"
              @click="emit('navigate', row as Document)">
              {{ (row as Document).docCode }}
            </button>
            <span v-else class="font-mono text-xs font-medium text-gray-700">
              {{ (row as Document).docCode }}
            </span>
            <Lock v-if="(row as Document).isConfidential" class="w-3 h-3 text-gray-400" title="Confidential" />
          </div>
        </td>

        <!-- Project field values (files only) -->
        <td v-for="f in visible" :key="f.id" class="px-4 py-3 text-sm text-gray-500">
          {{ (row as Document).type === 'folder' ? '-' : ((row as Document).fieldMap?.[f.fieldCode] ?? '-') }}
        </td>

        <!-- Version (files only) -->
        <td class="px-4 py-3 text-center text-sm text-gray-500">
          <span v-if="(row as Document).type === 'file'"
            :class="(row as Document).isSuperseded ? 'line-through text-gray-300' : ''">
            v{{ (row as Document).version }}
          </span>
          <span v-else class="text-gray-300">—</span>
        </td>

        <!-- Created date -->
        <td class="px-4 py-3 text-gray-400 text-sm">
          {{ formatWibDate((row as Document).createdAt) }}
        </td>

        <!-- Actions -->
        <td class="px-4 py-3">
          <button v-if="(row as Document).type === 'file'"
            @click="openDoc(row as Document)"
            class="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100"
            title="View document">
            <Eye class="w-4 h-4" />
          </button>
        </td>
      </template>
    </BackofficeDataTable>

    <DocumentModal
      :open="modalOpen"
      :data="selected"
      :fields="projectFields"
      @close="modalOpen = false"
    />
  </div>
</template>
