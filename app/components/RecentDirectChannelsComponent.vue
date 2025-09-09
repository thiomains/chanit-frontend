<script setup lang="ts">
const sessionState = useState('session')
const config = useRuntimeConfig()
const { $getOnlineStatus } = useNuxtApp()

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
        profilePictureUrl: string
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
  let name = channel.directMessageChannel.name
  if (!name) {
    const otherMember = getOtherMember(channel) as {
      username: string,
      userId: string
    }
    name = otherMember.username
  }
  return name
}

function subtitle(channel: RecentChannel) {
  if (!channel.lastMessage?.messageId) return " "
  let text = channel.lastMessage.author.username + ": "
  text = text + channel.lastMessage.body
  return text
}

function getOtherMember(channel: RecentChannel) {
  const session = sessionState.value as any
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
      return otherMember
    }
  }
}

function showChip(channel: RecentChannel) {
  const user = getOtherMember(channel) as {
    username: string,
    userId: string,
    profilePictureUrl: string
  }
  if (!$getOnlineStatus) return false
  return $getOnlineStatus(user.userId) === "online"
}

let data = ref<RecentChannel[]>([])
let loaded = ref(false)

function avatarUrl(channel: RecentChannel) {
  const member = getOtherMember(channel) as {
    username: string,
    userId: string,
    profilePictureUrl: string
  }
  return member.profilePictureUrl === "" ? "https://images.dog.ceo/breeds/hound-walker/n02089867_2596.jpg" : member.profilePictureUrl + "?size=40"
}

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
      <UChip inset position="bottom-right" size="xl" :show="showChip(channel)">
        <UAvatar :src="avatarUrl(channel)" size="lg"/>
      </UChip>
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