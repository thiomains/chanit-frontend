<script setup>
const session = useState("session")
const { $checkToken } = useNuxtApp()
const route = useRoute()

onMounted(() => {
  $checkToken()
  setInterval(() => {
    if (route.path !== "/login") $checkToken()
  }, 60000)
})
</script>

<template>
  <div>
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
