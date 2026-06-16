<script setup lang="ts">

const sessionState = useState('session')
const config = useRuntimeConfig()
const { $getOnlineStatus } = useNuxtApp()

let allFriends = ref<Friend[]>([])
let loaded = ref(false)

interface Friend {
  directChannelId: string
  user: {
    username: string
    userId: string
    profilePictureUrl: string
    bio: string
  }
}

const onlineFriends = computed(() => {
  if (!$getOnlineStatus) return []
  return allFriends.value.filter(friend => $getOnlineStatus(friend.user.userId) === "online")
})

async function loadFriends() {
  const session = sessionState.value as any

  const res = await $fetch(config.public.apiBaseUrl + "/user/me/friends", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.session.accessToken}`,
      Session: session.session.sessionId
    }
  })

  allFriends.value = res as Friend[]
  loaded.value = true
}

function friendStatus(userId: string): string {
  if (!$getOnlineStatus) return ""
  return $getOnlineStatus(userId) === "online" ? "Online" : "Offline"
}

onMounted(() => {
  loadFriends()
})

function bioText(bio: string) {
  if (!bio) return ''
  return bio
    .replace(/[*_~`#>|\\]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

</script>

<template>
  <div v-if="loaded" class="h-full flex flex-col justify-between">
    <div class="shrink-0 p-2">
      <p class="font-bold px-4">Online - {{ onlineFriends.length }}</p>
    </div>
    <div v-if="onlineFriends.length > 0" class="h-full overflow-auto">
      <div v-for="friend in onlineFriends" :key="friend.user.userId">
        <USeparator />
        <div class="items-center px-6 py-4 flex gap-2 transition-colors hover:bg-muted rounded-lg">
          <UAvatar :src="friend.user.profilePictureUrl + '?size=48'" size="3xl"/>
          <div class="flex flex-col flex-1">
            <p class="font-bold">{{ friend.user.username }}</p>
            <p class="text-[var(--ui-text-muted)] truncate">{{ bioText(friend.user.bio) }}</p>
          </div>
          <UFieldGroup size="lg">
            <UTooltip :delay-duration="0" text="Direct Message">
              <UButton :href="'/channels/me/' + friend.directChannelId" variant="subtle" color="neutral" icon="material-symbols:chat" />
            </UTooltip>
            <UTooltip :delay-duration="0" text="Start Voice Call">
              <UButton variant="subtle" color="neutral" icon="material-symbols:call" />
            </UTooltip>
          </UFieldGroup>
        </div>
      </div>
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-[var(--ui-text-muted)]">No friends online right now</p>
    </div>
  </div>
  <div v-else>
    <div class="p-4">
      <div class="h-12 items-center p-2">
        <USkeleton class="h-4 w-32" />
      </div>
      <div v-for="i in 10">
        <USeparator />
        <div class="items-center p-2 flex gap-2">
          <USkeleton class="size-12 rounded-full" />
          <div class="flex flex-col gap-2">
            <USkeleton class="h-4 w-3xs" />
            <USkeleton class="h-4 w-3xs" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
