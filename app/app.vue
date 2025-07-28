<script setup>
const session = useState("session")
const { $checkToken } = useNuxtApp()
const route = useRoute()

let showLoading = ref(true)

onMounted( async () => {
  if (route.path !== "/auth")
    await $checkToken()
  showLoading.value = false
  setInterval(() => {
    if (route.path !== "/login") $checkToken()
  }, 60000)
})
</script>

<template>
  <LoadingScreenComponent v-if="showLoading" class="h-screen" />
  <div v-else>
    <UApp>
      <NuxtLayout>
        <NuxtPage class="h-full w-full" />
      </NuxtLayout>
    </UApp>
  </div>

</template>
