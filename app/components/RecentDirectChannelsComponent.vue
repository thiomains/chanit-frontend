<script setup lang="ts">
const sessionState = useState('session')
const config = useRuntimeConfig()

interface RecentChannel {
  channelId: string,
  lastMessage?: {
    channelId: string
    createdAt: number,
    messageId: string,
    body: string,
    author: {
      username: string,
    }
  },
  directMessageChannel: {
    name?: string
    members: [
      {
        userId: string,
        username: string,
      }
    ]
  }
}

async function loadRecentChannels() {
  const session = sessionState.value as any

  const res = await $fetch(config.public.apiBaseUrl + "/user/me/recent", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.session.accessToken}`,
      Session: session.session.sessionId
    }
  })

  data.value = res as RecentChannel[]
  loaded.value = true
}

onMounted(async () => {
  await loadRecentChannels()
})

function title(channel: RecentChannel) {
  const session = sessionState.value as any
  let name = channel.directMessageChannel.name
  if (!name) {
    let members = channel.directMessageChannel.members
    for (let i = 0; i < members.length; i++) {
      const member = members[i] as {
        username: string,
        userId: string
      }
      if (member.userId === session.user.userId) {
        const otherMember = members[1-i] as {
          username: string,
          userId: string
        }
        name = otherMember.username
        break
      }
    }
  }
  return name
}

function subtitle(channel: RecentChannel) {
  if (!channel.lastMessage?.messageId) return " "
  let text = channel.lastMessage.author.username + ": "
  text = text + channel.lastMessage.body
  return text
}

let data = ref<RecentChannel[]>([])
let loaded = ref(false)

</script>

<template>
  <div v-if="loaded">
    <UButton
        class="flex-row text-start items-center justify-start gap-2 mb-1"
        v-for="channel of data"
        :key="channel.lastMessage?.messageId || channel.channelId"
        :to="'/channel/' + channel.channelId"
        active-variant="subtle"
        variant="ghost"
        color="neutral"
        block
    >
      <UAvatar src="https://images.dog.ceo/breeds/terrier-fox/n02095314_464.jpg" size="lg"/>
      <div class="overflow-hidden">
        <p class="truncate">{{ title(channel) }}</p>
        <p class="text-muted truncate">{{ subtitle(channel) }}</p>
      </div>
    </UButton>
  </div>
  <div v-else>

  </div>
</template>

<style scoped>

</style>