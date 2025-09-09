<script setup>

const { $connectWebsocket } = useNuxtApp()
const toast = useToast()
const audio = new Audio("https://cdn.faser.app/chanit/static/notification.ogg")



onMounted(async () => {
  const ws = await $connectWebsocket()
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data)
    if (message.type !== "notification") return
    audio.play()
    const options = {
      body: message.content.body,
      silent: true
    }
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      const notification = new Notification("Hi there!", options);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          const notification = new Notification("Hi there!", options);
        }
      });
    }
  })
})

</script>

<template>
  <div />
</template>

<style scoped>

</style>