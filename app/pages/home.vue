<script setup>

const session = useState('session')

if (session.value === undefined) {
  navigateTo({
    path: '/app'
  });
}

let sose = ref(session.value)

definePageMeta({
  layout: 'sidebar'
})
</script>

<template>

  <h1>{{ sose }}</h1>

  <FriendListComponent class="max-w-3xl" />

</template>

<style scoped>

</style>