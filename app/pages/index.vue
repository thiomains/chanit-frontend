<script setup lang="ts">
 onMounted(async () => {
   await navigateTo({
     path: "/app"
   })
   window.location.reload()
 })
</script>

<template>

</template>

<style scoped>

</style>