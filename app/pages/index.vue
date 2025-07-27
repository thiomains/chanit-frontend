<script setup>

const session = useState("session")

definePageMeta({
  layout: 'sidebar'
})
</script>

<template>

  <h1>{{ session }}</h1>

  <FriendListComponent />

</template>

<style scoped>

</style>