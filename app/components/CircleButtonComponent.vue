<script setup lang="ts">
const props = defineProps(['icon', 'click'])

</script>

<template>
  <div class="h-12 w-12 aspect-square bg-[var(--bg-light)] rounded-full items-center justify-center flex cursor-pointer select-none">
    <UIcon :name="props.icon" class="size-6" />
  </div>
</template>

<style scoped>

</style>