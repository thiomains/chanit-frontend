<script setup>
definePageMeta({
  layout: 'sidebar'
})

const config = useRuntimeConfig()
const route = useRoute()
const session = useState('session')
const {$checkToken} = useNuxtApp()

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
      members.splice(members.indexOf(session.value.user))
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

async function messageSent(message) {
  message.pending = true;
  messages.value.push(message)
  await fetchMessages()
}

</script>

<template>
  <div class="p-2">
    <UCard variant="subtle">
      <div class="flex items-center gap-2">
        <UAvatar src="https://images.dog.ceo/breeds/puggle/IMG_075018.jpg" />
        <p class="font-bold">{{ channelName }}</p>
      </div>
    </UCard>
    <div class="flex flex-col gap-2 my-4 overflow-y-scroll">
      <div v-for="message in messages">
        <TextMessageComponent :message="message" />
      </div>
    </div>
    <TextChannelInputComponent @message-sent="messageSent" />
  </div>
</template>

<style scoped>

</style>