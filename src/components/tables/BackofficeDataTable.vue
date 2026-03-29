<script setup lang="ts" generic="TData extends Record<string, unknown>">
import { ref, computed } from 'vue'
import { Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  data: TData[]
  columns: { key: string; label: string }[]
  pageSize?: number
}>(), { pageSize: 15 })

const search = ref('')
const page = ref(1)

const filtered = computed(() => {
  if (!search.value.trim()) return props.data
  const q = search.value.toLowerCase()
  return props.data.filter(row =>
    Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))
const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

function prev() { if (page.value > 1) page.value-- }
function next() { if (page.value < totalPages.value) page.value++ }
</script>

<template>
  <div class="bg-white border border-sidebar-border rounded-lg mb-4 overflow-hidden">

    <!-- Card header: search left, actions slot right -->
    <div class="px-4 py-3 border-b border-sidebar-border flex items-center justify-between gap-3">
      <div class="relative flex items-center">
        <Search class="w-4 h-4 text-m-muted absolute left-2.5 pointer-events-none" />
        <input
          v-model="search"
          @input="page = 1"
          placeholder="Search…"
          class="pl-8 pr-3 py-1.5 text-[13px] border border-sidebar-border rounded focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 w-56 transition-colors placeholder:text-m-muted text-body-text"
        />
      </div>
      <!-- Slot for Add / action buttons -->
      <slot name="actions" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-[13px]">
        <thead class="bg-sidebar-panel border-b border-sidebar-border">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left text-[11px] font-semibold text-nav-text uppercase tracking-wider whitespace-nowrap"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-sidebar-border bg-white">
          <tr v-if="paginated.length === 0">
            <td :colspan="columns.length" class="px-4 py-10 text-center text-m-muted text-[13px]">
              No records found
            </td>
          </tr>
          <tr
            v-for="(row, i) in paginated"
            :key="i"
            class="hover:bg-sidebar-panel/60 transition-colors"
          >
            <slot name="row" :row="row" :index="i" />
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination footer -->
    <div class="px-4 py-3 border-t border-dashed border-sidebar-border flex items-center justify-between">
      <span class="text-[12px] text-m-muted">
        {{ filtered.length }} record{{ filtered.length !== 1 ? 's' : '' }}
      </span>
      <div class="flex items-center gap-1">
        <button
          @click="prev"
          :disabled="page === 1"
          class="p-1.5 rounded hover:bg-sidebar-panel disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft class="w-3.5 h-3.5 text-nav-text" />
        </button>
        <span class="px-2 text-[12px] text-nav-text font-medium">{{ page }} / {{ totalPages }}</span>
        <button
          @click="next"
          :disabled="page === totalPages"
          class="p-1.5 rounded hover:bg-sidebar-panel disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight class="w-3.5 h-3.5 text-nav-text" />
        </button>
      </div>
    </div>

  </div>
</template>
