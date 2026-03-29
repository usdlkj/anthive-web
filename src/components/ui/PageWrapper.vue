<script setup lang="ts">
defineProps<{
  title: string
  breadcrumb?: string
}>()
</script>

<template>
  <div class="px-2 py-4">
    <!-- Page title bar -->
    <div class="flex items-center justify-between mb-4 pb-1">
      <h4 class="text-[18px] font-medium text-heading leading-[22px] m-0">{{ title }}</h4>
      <nav v-if="breadcrumb || $slots.breadcrumb" class="text-[13px] text-m-muted flex items-center gap-1">
        <span v-if="breadcrumb">{{ breadcrumb }}</span>
        <slot name="breadcrumb" />
      </nav>
    </div>
    <!-- Page content -->
    <slot />
  </div>
</template>
