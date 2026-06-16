<script setup lang="ts">
const sessionState = useState("session")
const config = useRuntimeConfig()
const props = defineProps(["message"])
const emit = defineEmits(["reply", "mention-user"])
const message = props.message as {
  messageId: string,
  body: string,
  author?: {
    userId?: string,
    username?: string
  }
}

import MessageAttachmentsComponent from "~/components/MessageAttachmentsComponent.vue";

const toast = useToast()

const isOwn = computed(() => {
  const session = sessionState.value as { user?: { userId?: string }, session?: { sessionId?: string, accessToken?: string } }
  return session?.user?.userId != null && message?.author?.userId != null && session.user.userId === message.author.userId
})

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: label, color: "success" })
  } catch (e) {
    console.error("Failed to copy:", e)
  }
}

function onCopyText() {
  copyToClipboard(message.body || "", "Text copied")
}

function onCopyMessageId() {
  copyToClipboard(message.messageId, "Message ID copied")
}

function onMentionUser() {
  emit("mention-user", message.author?.username)
}

function onReportMessage() {
  toast.add({ title: "Message reported", description: "Thank you for your report.", color: "success" })
}

const contextMenuItems = computed(() => [
  [
    ...(isOwn.value
      ? [
          {
            label: "Reply",
            icon: "material-symbols:reply",
            color: "neutral",
            onSelect() {
              emit("reply", message)
            }
          },
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
          {
            label: "Copy Text",
            icon: "material-symbols:content-copy",
            color: "neutral",
            onSelect() {
              onCopyText()
            }
          },
          {
            label: "Copy Message ID",
            icon: "material-symbols:tag",
            color: "neutral",
            onSelect() {
              onCopyMessageId()
            }
          }
        ]
      : [
          {
            label: "Reply",
            icon: "material-symbols:reply",
            color: "neutral",
            onSelect() {
              emit("reply", message)
            }
          },
          {
            label: "Copy Text",
            icon: "material-symbols:content-copy",
            color: "neutral",
            onSelect() {
              onCopyText()
            }
          },
          {
            label: "Copy Message ID",
            icon: "material-symbols:tag",
            color: "neutral",
            onSelect() {
              onCopyMessageId()
            }
          },
          {
            label: "Mention",
            icon: "material-symbols:alternate-email",
            color: "neutral",
            onSelect() {
              onMentionUser()
            }
          },
          {
            label: "Report",
            icon: "material-symbols:flag",
            color: "error",
            onSelect() {
              onReportMessage()
            }
          }
        ]
    )
  ]
])

async function deleteMessage() {
  const session = sessionState.value as {
    session: {
      sessionId: string,
      accessToken: string
    }
  }
  loading.value = true
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
  loading.value = false
}

let loading = ref(false)
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
  loading.value = true
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
  loading.value = false
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