<script setup>
const session = useState("session")
const { $checkToken, $connectWebsocket } = useNuxtApp()
const route = useRoute()

let showLoading = ref(true)

async function prepare() {
  if (route.path !== "/auth") {
    if (await $checkToken())
      await $connectWebsocket()
  }

  showLoading.value = false
}

onMounted( async () => {
  await prepare()
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

<style src="@/assets/css/markdown.css"></style>