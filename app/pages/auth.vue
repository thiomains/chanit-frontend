<script setup>

const { $axios } = useNuxtApp()
const route = useRoute()
const { $checkToken } = useNuxtApp()

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

  await $checkToken()

  if (res.status === 200 || res.status === 201) {
    navigateTo({
      path: '/'
    })
  }
})

</script>

<template>
  fesir
</template>

<style scoped>

</style>