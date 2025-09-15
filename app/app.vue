<script setup>
const session = useState("session")
const { $connect, $startRefreshTimer, $connectWebsocket } = useNuxtApp()
const route = useRoute()

let showLoading = ref(true)

function websocketConnection() {
  setInterval(async () => {
    if (route.path === "/login" || route.path === "/verify-email" || route.path === "/auth" || route.path === "/" || route.path === "/logout") return
    try {
      const ws = await $connectWebsocket()
      showLoading.value = !ws || ws.readyState !== WebSocket.OPEN;
    } catch (e) {
      showLoading.value = true
    }
  }, 1000)
}

onMounted( async () => {
  let path = route.path
  if (path === "/login" || path === "/verify-email" || path === "/auth" || path === "/" || path === "/logout") {
    showLoading.value = false
    return
  }
  if (path === "/register") {
    await navigateTo('/login?register=1')
    window.location.reload()
    return
  }
  navigateTo('/app')
  await $connect()
  let ws = await $connectWebsocket()
  $startRefreshTimer()
  while (!ws) ws = await $connectWebsocket()
  websocketConnection()
  if (path === "/app") path = "/channels/me"
  await navigateTo({
    path: path
  })
  showLoading.value = false
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