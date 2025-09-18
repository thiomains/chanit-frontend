<script setup lang="ts">



</script>

<template>
  <div class="w-screen h-screen absolute z-30 p-4">
    <div class="h-full w-full bg-default/50 backdrop-blur-2xl ring ring-muted rounded-[1.55rem] p-2">
      <div class="flex justify-between items-center">
        <h1 class="text-xl font-bold px-3">Group Name</h1>
        <UButton class="rounded-xl" icon="material-symbols:close-rounded" variant="outline" color="neutral" size="xl"/>
      </div>
    </div>
  </div>
  <div class="h-screen w-screen flex flex-col">
    <div class="p-2 pb-0">
      <UCard variant="subtle">
        <div class="flex items-center gap-2">
          <UButton class="sm:hidden" icon="material-symbols:arrow-back-ios-new-rounded" variant="ghost" color="neutral"/>
          <slot name="header"/>
        </div>
      </UCard>
    </div>
    <slot />
    <div>
      <slot name="footer"/>
    </div>
  </div>
</template>

<style scoped>

</style>