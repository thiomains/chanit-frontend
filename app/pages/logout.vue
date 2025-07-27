<script setup lang="ts">

const session = useState('session')
const config = useRuntimeConfig()

onMounted(async () => {
  try {
    const res = await $fetch(config.public.apiBaseUrl + '/auth/logout', {
      method: "POST",
      credentials: "include"
    })

    session.value = {}

    await navigateTo({
      path: "/login"
    })
  } catch (e) {
    const error = e as any;
    console.log(error)
  }

})

</script>

<template>
<p>Logging you out</p>
</template>

<style scoped>

</style>