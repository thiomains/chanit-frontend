<script setup lang="ts">

async function launchApp() {
  await navigateTo({
    path: '/app'
  })
  window.location.reload()
}

</script>

<template>

  <UPageHero title="Chanit.app" description="Conversations built for the future.">
    <template #links>
      <UButton label="Go to app" size="xl" @click="launchApp"/>
    </template>
  </UPageHero>

</template>

<style scoped>

</style>