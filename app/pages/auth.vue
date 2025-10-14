<script setup>

const route = useRoute()
const { $checkToken } = useNuxtApp()
const config = useRuntimeConfig()

onMounted( async () => {

  const code = route.query.code

  if (!code) {
    navigateTo({
      path: '/login'
    })
  }

  try {
    const res = await $fetch(config.public.apiBaseUrl + "/auth/faser", {
      method: "POST",
      body: {
        code: code
      },
      credentials: "include"
    })

    await navigateTo({
      path: '/app'
    })
    window.location.reload()

  } catch (e) {
    console.log(e)
  }
})

</script>

<template>
  <div class="h-screen w-screen flex justify-center items-center">
    <UCard>
      <div class="flex items-center gap-2">
        <UIcon name="svg-spinners:180-ring-with-bg"/>
        <p>Authenticating...</p>
      </div>
    </UCard>
  </div>
</template>

<style scoped>

</style>