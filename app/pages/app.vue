<script setup lang="ts">
useSeoMeta({
  title: 'Chanit',
  ogTitle: 'Chanit',
  description: 'Conversations built for the future.',
  ogDescription: 'Conversations built for the future.',
  ogImage: 'https://cdn.faser.app/chanit/chanit-static-files/logo.png',
})

onMounted(() => {
  navigateTo({
    path: '/channels/me'
  })
})
</script>

<template>

</template>

<style scoped>

</style>