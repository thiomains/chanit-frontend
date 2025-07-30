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

    if (res.channel.channelType === "direct-message") {
      let members = res.channel.directMessageChannel.members
      members.splice(members.indexOf(session.value.user), 1)
      channelName.value = members[0]
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
    messages.value = res
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
    if (message.type !== "message") return
    const receivedMessage = message.message
    if (receivedMessage.channelId !== route.params.id) return
    messages.value.unshift(receivedMessage)
  })
})

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

</script>

<template>
  <div class="w-full h-full flex gap-2 ">
    <div class="w-full h-full flex flex-col">
      <UCard variant="subtle">
        <div class="flex items-center gap-2">
          <UAvatar src="https://images.dog.ceo/breeds/puggle/IMG_075018.jpg" />
          <p class="font-bold">{{ channelName }}</p>
        </div>
      </UCard>
      <div class="flex-1 overflow-y-scroll flex flex-col-reverse" >
        <div :key="message.messageId" v-for="( message, i ) in messages">
          <USeparator
              class="mt-4"
              v-if="!isSameDay(message, messages[i+1])"
              :label="DateTime.fromJSDate(
                  new Date(message.createdAt)
                  ).toRelativeCalendar({
                  locale: 'en-US'
              })"/>
          <TextMessageComponent :grouped="isGrouped(message, messages[i+1])" :message="message"/>
        </div>
      </div>
      <TextChannelInputComponent />
    </div>
    <div>
      <USkeleton class="w-xs h-full" />
    </div>
  </div>
</template>

<style scoped>

</style>