<script setup lang="ts">

</script>

<template>
  <UCard class="w-full grow">
    <div class="flex flex-col gap-2 mb-4">
      <UButton size="xl" to="/" label="Friends" active-variant="subtle" color="neutral" variant="ghost" icon="material-symbols:group"/>
      <UButton size="xl" to="/test" label="Test" active-variant="subtle" color="neutral" variant="ghost" icon="material-symbols:question-mark"/>
      <UButton size="xl" to="/logout" label="Log out" active-variant="subtle" color="neutral" variant="ghost" icon="material-symbols:exit-to-app"/>
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