<script setup lang="ts">
const sessionState = useState("session")
const config = useRuntimeConfig()
const props = defineProps(["message"])
const message = props.message as {
  messageId: string
}

import MessageAttachmentsComponent from "~/components/MessageAttachmentsComponent.vue";

const contextMenuItems = ref([
  [
    {
      label: "Delete Message",
      icon: "material-symbols:delete",
      color: "error",
      onSelect() {
        deleteMessage()
      }
    }
  ],
])

async function deleteMessage() {
  const session = sessionState.value as {
    session: {
      sessionId: string,
      accessToken: string
    }
  }
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/message/" + message.messageId, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.session.accessToken}`,
        Session: session.session.sessionId
      },
    })
  } catch (e) {
    console.log(e)
  }
}

</script>

<template>
  <UContextMenu :items="contextMenuItems">
    <slot/>
  </UContextMenu>
</template>

<style scoped>

</style>