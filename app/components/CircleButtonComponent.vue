<script setup lang="ts">
const props = defineProps(['icon', 'click'])

</script>

<template>
  <div class="h-12 w-12 aspect-square bg-[var(--bg-light)] rounded-full items-center justify-center flex cursor-pointer select-none">
    <span class="material-symbols-outlined">{{ props.icon }}</span>
  </div>
</template>

<style scoped>

</style>