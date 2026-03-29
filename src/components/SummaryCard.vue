<script setup lang="ts">
defineProps<{ title: string; value: string | number; description?: string }>()
</script>

<template>
  <div class="bg-white border border-sidebar-border rounded-lg p-5">
    <p class="text-[13px] font-medium text-m-muted uppercase tracking-wide mb-2">{{ title }}</p>
    <p class="text-3xl font-bold text-heading">{{ value }}</p>
    <p v-if="description" class="mt-1 text-[13px] text-m-muted">{{ description }}</p>
  </div>
</template>
