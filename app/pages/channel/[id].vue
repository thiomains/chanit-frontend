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
    scrollToBottom(true)
  } catch (e) {
    console.log(e)
  }
}

let channelName = ref('')

let messages = ref([])

onMounted(async () => {
  const ws = await $connectWebsocket()
  ws.send(JSON.stringify({
    type: "view-channel",
    channelId: route.params.id
  }))
  ws.addEventListener("message", () => {
    const message = JSON.parse(event.data)
    if (message.type === "message") messageSentReceived(message)
    if (message.type === "message-delete") messageDeletedReceived(message)
  })
})

function messageSentReceived(message) {
  const receivedMessage = message.message
  if (receivedMessage.channelId !== route.params.id) return
  receivedMessage.author.id = receivedMessage.author.userId
  messages.value.push(receivedMessage)
  scrollToBottom()
}

function messageDeletedReceived(message) {
  for (let i = 0; i < messages.value.length; i++) {
    const msg = messages.value[i]
    if (msg.messageId !== message.messageId) continue
    messages.value.splice(i, 1)
  }
}

function isGrouped(message, previousMessage) {
  if (!previousMessage) return false
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
    const threshold = 200 // Pixel-Toleranz
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight

    if (distanceFromBottom > threshold && !force) return

    nextTick(() => {
      el.scrollTop = el.scrollHeight
    })
  })
}

let fetchingMessages = ref(true)
async function handleScroll(event) {
  if (messages.value.length === 0) return
  if (event.srcElement.scrollTop < 1000) {
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

</script>

<template>
  <div class="w-full h-full flex gap-2">
    <div class="w-full h-full flex flex-col">
      <UCard variant="subtle">
        <div class="flex items-center gap-2">
          <UAvatar src="https://images.dog.ceo/breeds/puggle/IMG_075018.jpg" />
          <p class="font-bold">{{ channelName }}</p>
        </div>
      </UCard>
      <div class="flex-1 overflow-y-scroll flex flex-col" ref="messagesContainer" @scroll="handleScroll">
        <div :key="message.messageId" v-for="( message, i ) in messages">
          <USeparator
              class="mt-4"
              v-if="!isSameDay(message, messages[i-1])"
              :label="DateTime.fromJSDate(
                  new Date(message.createdAt)
                  ).toRelativeCalendar({
                  locale: 'en-US'
              })"/>
          <TextMessageComponent :grouped="isGrouped(message, messages[i-1])" :message="message"/>
        </div>
      </div>
      <TextChannelInputComponent />
    </div>
    <!-- <div>
      <USkeleton class="w-xs h-full" />
    </div> -->
  </div>
</template>

<style scoped>

</style>