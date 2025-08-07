<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const session = useState("session")
const { $connectWebsocket } = useNuxtApp()

const emit = defineEmits(['message-sent'])

let messageInput = ref("")

async function enterPressed() {
  const messageBody = messageInput.value.trim()
  if (messageBody.length === 0 && attachments.value.length === 0) {
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
        body: messageBody,
        attachmentCount: attachments.value.length
      }
    })

    for (let i = 0; i < attachments.value.length; i++) {
      console.log(attachments.value[i])
      const formData = new FormData()
      formData.append('attachment', attachments.value[i])
      const uploadRes = await $fetch(config.public.apiBaseUrl + "/message/" + res.messageId + "/attachments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.value.session.accessToken}`,
          Session: session.value.session.sessionId
        },
        body: formData
      })
    }

    attachments.value = []
    attachmentCollapsible.value = false

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

let attachmentCollapsible = ref(false)

function toggleAttachmentCollapsible() {
  attachmentCollapsible.value = !attachmentCollapsible.value
}

let attachments = ref([])
function attachmentsUpdate() {
  if (attachments.value.length > 9) {
    attachments.value = attachments.value.slice(0, 9)
    tooManyFiles.value = true
  }
  for (let i = 0; i < attachments.value.length; i++) {
    if (attachments.value[i].size > 78643200) {
      attachments.value.splice(i, 1)
      filesTooLarge.value = true
    }
  }
}

let tooManyFiles = ref(false)
let filesTooLarge = ref(false)


</script>

<template>
  <div class="h-4 px-6 mt-2">
    <p v-if="showTyping" ><b class="font-bold">{{ typingUser }}</b> is typing...</p>
  </div>
  <div class="p-4">
    <UCollapsible :open="attachmentCollapsible" :unmount-on-hide="false">
      <template #content>
        <UFileUpload
            v-model="attachments"
            @update:modelValue="attachmentsUpdate"
            class="mx-4 mb-4"
            label="Drop your files here"
            description="Any files (max. 75MB)"
            layout="list"
            multiple
        />
      </template>
    </UCollapsible>
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
        <UButton @click="toggleAttachmentCollapsible" icon="material-symbols:add-circle-rounded" variant="link" color="neutral" size="xl" />
      </template>
    </UInput>
  </div>
  <UModal
    v-model:open="tooManyFiles"
  >
    <template #content>
      <div class="m-4 my-12 flex-col items-center text-center">
        <UIcon name="material-symbols:file-present-outline" class="size-12" />
        <h2 class="text-xl font-bold">Too many attachments</h2>
        <p class="text-muted">You may only attach 9 files per message</p>
      </div>
    </template>
  </UModal>
  <UModal
      v-model:open="filesTooLarge"
  >
    <template #content>
      <div class="m-4 my-12 flex-col items-center text-center">
        <UIcon name="material-symbols:file-present-outline" class="size-12" />
        <h2 class="text-xl font-bold">File too large</h2>
        <p class="text-muted">File attachments are limited to 75MB in size</p>
      </div>
    </template>
  </UModal>
</template>

<style scoped>

</style>