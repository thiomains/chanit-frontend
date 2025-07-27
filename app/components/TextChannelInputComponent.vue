<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const session = useState("session")

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
</script>

<template>
  <div class="p-4">
    <UInput
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