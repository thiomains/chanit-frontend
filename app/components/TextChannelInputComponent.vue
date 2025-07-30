<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const session = useState("session")
const { $connectWebsocket } = useNuxtApp()

const emit = defineEmits(['message-sent'])

let messageInput = ref("")

async function enterPressed() {
  const messageBody = messageInput.value.trim()
  if (messageBody.length === 0) {
    return
  }
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/channel/" + route.params.id + "/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      },
      body: {
        body: messageBody
      }
    })

    emit("message-sent", res)

    messageInput.value = ""
  } catch (e) {
    console.log(e)
  }
}

onMounted(async () => {
  const ws = await $connectWebsocket()
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data)
    if (!message) return
    if (message.type === "message") showTyping.value = false
    if (message.type !== "typing") return
    if (message.channelId !== route.params.id) return
    if (message.userId === session.value.user.userId) return
    lastTyping.value = Date.now()
    showTyping.value = true
    setTimeout(() => {
      if (lastTyping.value < Date.now() - 3000) showTyping.value = false
    }, 4000)
  })
})

async function sendTyping() {
  const ws = await $connectWebsocket()
  ws.send(JSON.stringify({
    type: "typing",
    channelId: route.params.id
  }))
}

let lastTyping = ref(0)
let showTyping = ref(false)
let typingUser = ref({})

</script>

<template>
  <div class="h-4 px-6 mt-2">
    <p v-if="showTyping" ><b class="font-bold">{{ typingUser }}</b> is typing...</p>
  </div>
  <div class="p-4">
    <UInput
        @input="sendTyping"
        @keydown.enter="enterPressed"
        class="w-full"
        v-model="messageInput"
        placeholder="Type a message..."
        size="xl"
        :ui="{ leading: 'ps-1' }"
        autofocus
    >
      <template #leading>
        <UButton icon="material-symbols:add-circle-rounded" variant="link" color="neutral" size="xl" />
      </template>
    </UInput>
  </div>
</template>

<style scoped>

</style>