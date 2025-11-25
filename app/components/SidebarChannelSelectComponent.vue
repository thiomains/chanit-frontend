<script setup lang="ts">

</script>

<template>
  <UCard class="w-full grow layer-1">
    <div class="flex flex-col gap-2 mb-4">
      <LinkButton to="/channels/me" label="Friends" icon="material-symbols:group" layer="2"/>
    </div>
    <USeparator/>
    <div class="flex flex-col gap-2 mb-4">
      <h3 class="text-dimmed mt-4 font-bold">Recent Direct Messages</h3>
        <RecentDirectChannelsComponent />
    </div>
  </UCard>
</template>

<style scoped>

</style>