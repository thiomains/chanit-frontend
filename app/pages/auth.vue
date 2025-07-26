<script setup>

const { $axios } = useNuxtApp()
const route = useRoute()

onMounted( async () => {
  const code = route.query.code

  if (!code) {
    navigateTo({
      path: '/login'
    })
  }

  const res = await $axios.post('/auth/faser', {
    code: code
  })

  if (res.status === 200 || res.status === 201) {
    navigateTo({
      path: '/app'
    })
  }
})

</script>

<template>
  fesir
</template>

<style scoped>

</style>