<script setup lang="ts">

</script>

<template>
  <div class="w-screen h-screen flex gap-2 p-2">
    <div class="w-xs h-full shrink-0">
      <USkeleton class="w-full h-full" />
    </div>
    <div class="w-20 h-full shrink-0">
      <USkeleton class="w-20 h-full" />
    </div>
    <div class="w-xs h-full shrink-0">
      <USkeleton class="w-xs h-full" />
    </div>
    <div class="h-full w-full shrink">
      <slot />
    </div>
  </div>


</template>

<style scoped>

</style>