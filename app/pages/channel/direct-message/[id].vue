<script setup>

definePageMeta({
  layout: 'sidebar'
})

const { $axios } = useNuxtApp()
const session = useState('session', () => null)
const route = useRoute()

const id = route.params.id



</script>

<template>

</template>

<style scoped>

</style>