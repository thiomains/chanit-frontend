<script setup>
definePageMeta({
  layout: 'sidebar'
})

const config = useRuntimeConfig()
const route = useRoute()
const session = useState('session')
const { $connectWebsocket } = useNuxtApp()
import { DateTime } from "luxon"

onMounted(async () => {

  try {
    const res = await $fetch(config.public.apiBaseUrl + "/channel/" + route.params.id, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      }
    })

    for (let i = 0; i < res.directMessageChannel.members.length; i++) {
      const user = res.directMessageChannel.members[i]
      const profile = await $fetch(config.public.apiBaseUrl + "/user/" + user.userId + "/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.value.session.accessToken}`,
          Session: session.value.session.sessionId
        }
      })
    }

    if (res.channelType === "direct-message") {
      let name = res.directMessageChannel.name
      if (!name) {
        let members = res.directMessageChannel.members
        for (let i = 0; i < members.length; i++) {
          if (members[i].userId === session.value.user.userId) {
            name = members[1-i].username
            break
          }
        }
      }
      channelName.value = name
    }

  } catch (e) {
    console.log(e)
  }

  fetchMessages()

})

async function fetchMessages() {
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/channel/" + route.params.id + "/messages", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      }
    })
    messages.value = res.reverse()
    for (const msg of messages.value) {
      if (msg.replyTo) {
        const parent = messages.value.find(m => m.messageId === msg.replyTo)
        if (parent) msg.replyToUsername = parent.author.username
      }
    }
    scrollToBottom(true)
  } catch (e) {
    console.log(e)
  }
}

let channelName = ref('')

let messages = ref([])

const activeThreadRootId = ref(null)
const threadMessages = ref([])
const replyToMessage = ref(null)
const inputComponentRef = ref()
const inThreadView = computed(() => activeThreadRootId.value !== null)
const displayedMessages = computed(() =>
  inThreadView.value ? threadMessages.value : messages.value
)

onMounted(async () => {
  const ws = await $connectWebsocket()
  ws.send(JSON.stringify({
    type: "view-channel",
    channelId: route.params.id
  }))
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data)
    if (message.type === "message") messageSentReceived(message)
    if (message.type === "message-delete") messageDeletedReceived(message)
    if (message.type === "message-edit") messageEditedReceived(message)
  })

  // Focus input when user starts typing anywhere on the page
  document.addEventListener("keydown", onGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener("keydown", onGlobalKeydown)
})

function onGlobalKeydown(event) {
  // Ctrl+V: focus input so paste goes there
  if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
    inputComponentRef.value?.focusTextarea()
    return
  }
  // Only respond to printable single characters
  if (event.ctrlKey || event.altKey || event.metaKey) return
  if (event.key.length !== 1) return
  // Don't steal focus from other inputs/modals
  const tag = document.activeElement?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return
  if (document.activeElement?.isContentEditable) return
  inputComponentRef.value?.focusTextarea()
}

function messageSentReceived(message) {
  const receivedMessage = message.message
  if (receivedMessage.channelId !== route.params.id) return

  receivedMessage.author.id = receivedMessage.author.userId

  // Check if message already exists (added instantly via @message-sent)
  for (let i = 0; i < messages.value.length; i++) {
    if (messages.value[i].messageId === receivedMessage.messageId) {
      messages.value[i] = receivedMessage
      // Also update in threadMessages if in thread view
      if (inThreadView.value) {
        for (let j = 0; j < threadMessages.value.length; j++) {
          if (threadMessages.value[j].messageId === receivedMessage.messageId) {
            threadMessages.value[j] = receivedMessage
            return
          }
        }
      threadMessages.value.push(receivedMessage)
        replyToMessage.value = receivedMessage
      }
      return
    }
  }

  messages.value.push(receivedMessage)

  // Resolve replyToUsername for new message
  if (receivedMessage.replyTo) {
    const parent = messages.value.find(m => m.messageId === receivedMessage.replyTo)
    if (parent) receivedMessage.replyToUsername = parent.author.username
  }

  // If in thread view and message is a reply in the current thread chain, add it
  if (inThreadView.value) {
    const lastThreadMsg = threadMessages.value[threadMessages.value.length - 1]
    if (receivedMessage.replyTo === lastThreadMsg?.messageId) {
      threadMessages.value.push(receivedMessage)
    }
  }

  if (!inThreadView.value) scrollToBottom()
}

function onMessageSent(res) {
  // Prevent duplicate: message may already have arrived via WebSocket before POST response
  if (messages.value.some(m => m.messageId === res.messageId)) return

  // POST response has author as a plain user ID; construct proper author from session
  res.author = {
    id: session.value.user.userId,
    userId: session.value.user.userId,
    username: session.value.user.username,
    profilePictureUrl: session.value.user.profilePictureUrl
  }
  if (replyToMessage.value) {
    res.replyToUsername = replyToMessage.value.author.username
  }
  messages.value.push(res)
  if (inThreadView.value) {
    if (!threadMessages.value.some(m => m.messageId === res.messageId)) {
      threadMessages.value.push(res)
    }
    replyToMessage.value = res
  } else {
    replyToMessage.value = null
  }
  scrollToBottom(true)
}

function messageDeletedReceived(message) {
  for (let i = 0; i < messages.value.length; i++) {
    const msg = messages.value[i]
    if (msg.messageId !== message.messageId) continue
    messages.value.splice(i, 1)
  }
  for (let i = 0; i < threadMessages.value.length; i++) {
    const msg = threadMessages.value[i]
    if (msg.messageId !== message.messageId) continue
    threadMessages.value.splice(i, 1)
  }
}

function messageEditedReceived(message) {
  for (let i = 0; i < messages.value.length; i++) {
    const msg = messages.value[i]
    if (msg.messageId !== message.messageId) continue
    messages.value[i].body = message.body
    messages.value[i].lastEdited = message.lastEdited
  }
  for (let i = 0; i < threadMessages.value.length; i++) {
    const msg = threadMessages.value[i]
    if (msg.messageId !== message.messageId) continue
    threadMessages.value[i].body = message.body
    threadMessages.value[i].lastEdited = message.lastEdited
  }
}

function isGrouped(message, previousMessage) {
  if (!previousMessage) return false
  if (message.replyTo) return false
  if (previousMessage.replyTo) return false
  if (message.author.userId !== previousMessage.author.userId) return false
  if (!isSameDay(message, previousMessage)) return false
  if (Math.abs(message.createdAt - previousMessage.createdAt) > 15 * 60 * 1000) return false
  return true
}

function isSameDay(message, previousMessage) {
  if (!previousMessage) return false
  const currentDate = DateTime.fromJSDate(new Date(message.createdAt)).toFormat(
      'yyyy-MM-dd'
  )
  const previousDate = DateTime.fromJSDate(new Date(previousMessage.createdAt)).toFormat(
      'yyyy-MM-dd'
  )

  return currentDate === previousDate
}

import { useTemplateRef } from 'vue'

const myEl = useTemplateRef('messagesContainer')

function scrollToBottom(force) {
  nextTick(() => {
    const el = myEl.value
    const threshold = 500 // Pixel-Toleranz
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight

    if (distanceFromBottom > threshold && !force) return

    nextTick(() => {
      el.scrollTop = el.scrollHeight
    })
  })
}

let fetchingMessages = ref(true)
async function handleScroll(event) {
  if (inThreadView.value) return
  if (messages.value.length === 0) return
  if (event.srcElement.scrollTop < 100) {
    if (fetchingMessages.value) return

    fetchingMessages.value = true

    try {
      const res = await $fetch(config.public.apiBaseUrl + "/channel/" + route.params.id + "/messages?before=" + messages.value.at(0).createdAt, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.value.session.accessToken}`,
          Session: session.value.session.sessionId
        }
      })

      messages.value = res.reverse().concat(messages.value)
    } catch (e) {
      console.log(e)
    }
  } else fetchingMessages.value = false
}

async function enterThreadView(messageId) {
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/message/" + messageId + "/replies", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      }
    })
    threadMessages.value = res
    activeThreadRootId.value = messageId
    replyToMessage.value = res[res.length - 1]
    nextTick(() => scrollToBottom(true))
  } catch (e) {
    console.log(e)
  }
}

function exitThreadView() {
  activeThreadRootId.value = null
  threadMessages.value = []
  replyToMessage.value = null
}

function onReplyClick(message) {
  replyToMessage.value = message
  nextTick(() => {
    inputComponentRef.value?.focusTextarea()
  })
}

function onMentionUser(username) {
  inputComponentRef.value?.insertAtCursor(`@${username} `)
}

function cancelReply() {
  replyToMessage.value = null
}

</script>

<template>
  <div class="w-full h-full flex gap-2">
    <div class="w-full h-full flex flex-col">
      <UCard variant="subtle">
        <div class="flex items-center gap-2">
          <UAvatar src="https://images.dog.ceo/breeds/puggle/IMG_075018.jpg" />
          <p class="font-bold">{{ channelName }}</p>
          <div v-if="inThreadView" class="flex items-center gap-2 ml-auto">
            <UIcon name="material-symbols:forum" class="size-5 text-dimmed" />
            <span class="text-dimmed text-sm">Thread</span>
            <UButton icon="material-symbols:close" variant="ghost" color="neutral" size="xs" @click="exitThreadView" />
          </div>
        </div>
      </UCard>
      <div class="flex-1 overflow-y-scroll flex flex-col" ref="messagesContainer" @scroll="handleScroll">
        <div :key="message.messageId" v-for="( message, i ) in displayedMessages">
          <USeparator
              class="mt-4"
              v-if="!isSameDay(message, displayedMessages[i-1])"
              :label="DateTime.fromJSDate(
                  new Date(message.createdAt)
                  ).toRelativeCalendar({
                  locale: 'en-US'
              })"/>
          <TextMessageComponent
            :grouped="isGrouped(message, displayedMessages[i-1])"
            :message="message"
            :in-thread-view="inThreadView"
            @thread-click="enterThreadView"
            @reply-click="onReplyClick"
            @mention-user="onMentionUser"
          />
        </div>
      </div>
      <TextChannelInputComponent
        ref="inputComponentRef"
        :reply-to="replyToMessage"
        :in-thread-view="inThreadView"
        @message-sent="onMessageSent"
        @cancel-reply="cancelReply"
      />
    </div>
    <!-- <div>
      <USkeleton class="w-xs h-full" />
    </div> -->
  </div>
</template>

<style scoped>

</style>