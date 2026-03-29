<script setup lang="ts">
import { X } from 'lucide-vue-next'
defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

        <!-- Dialog panel -->
        <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-sidebar-border flex-shrink-0">
            <h5 class="text-[14px] font-medium text-heading m-0">{{ title }}</h5>
            <button
              @click="emit('close')"
              class="w-7 h-7 flex items-center justify-center rounded text-m-muted hover:text-heading hover:bg-sidebar-panel transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 py-5 overflow-y-auto">
            <slot />
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>
