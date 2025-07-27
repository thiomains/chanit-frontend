<script setup>
const session = useState("session")
const { $checkToken } = useNuxtApp()
const route = useRoute()

let showLoading = ref(false)

onMounted( async () => {
  await $checkToken()
  showLoading.value = true
  setInterval(() => {
    if (route.path !== "/login") $checkToken()
  }, 60000)
})
</script>

<template>
  <div v-if="showLoading">
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
  <LoadingScreenComponent v-else class="h-screen" />
</template>
