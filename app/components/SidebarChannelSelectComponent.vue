<script setup lang="ts">

</script>

<template>
  <UCard class="w-full grow">
    <div class="flex flex-col gap-2 mb-4">
      <UButton size="xl" to="/channels/me" label="Friends" active-variant="subtle" color="neutral" variant="ghost" icon="material-symbols:group"/>
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