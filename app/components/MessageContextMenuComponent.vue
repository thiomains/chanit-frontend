<script setup lang="ts">
const sessionState = useState("session")
const config = useRuntimeConfig()
const props = defineProps(["message"])
const message = props.message as {
  messageId: string,
  body: string
}

import MessageAttachmentsComponent from "~/components/MessageAttachmentsComponent.vue";

const contextMenuItems = ref([
  [
    {
      label: "Edit",
      icon: "material-symbols:edit",
      color: "neutral",
      onSelect() {
        openEditModal()
      }
    },
    {
      label: "Delete",
      icon: "material-symbols:delete",
      color: "error",
      onSelect() {
        deleteMessage()
      }
    },
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

let editModalOpen = ref(false)
let editedBody = ref(message.body)

async function openEditModal() {
  editModalOpen.value = true
  editedBody.value = message.body
}

async function closeEditModal() {
  editModalOpen.value = false
}

async function editMessage() {
  const session = sessionState.value as {
    session: {
      sessionId: string,
      accessToken: string
    }
  }
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/message/" + message.messageId, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.session.accessToken}`,
        Session: session.session.sessionId
      },
      body: {
        body: editedBody.value
      }
    })

    closeEditModal()
  } catch (e) {
    console.log(e)
  }
}

</script>

<template>
  <UContextMenu :items="contextMenuItems">
    <slot/>
  </UContextMenu>
  <UModal v-model:open="editModalOpen">
    <template #content>
      <UCard>
        <template #header>
          <h2 class="text-xl font-bold">Edit Message</h2>
        </template>
        <template #default>
          <UTextarea
              v-model="editedBody"
              size="xl"
              @keydown.enter="editMessage"
              class="w-full min-h-14"
              placeholder="Edit Message..."
              autofocus
              autoresize
              :maxrows="10"
              :rows="1"
          />
        </template>
        <template #footer>
          <div class="justify-end flex gap-2 w-full">
            <UButton @click="closeEditModal" label="Cancel" color="neutral" variant="subtle"/>
            <UButton @click="editMessage" :loading="loading" label="Edit Message"/>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>

</style>