<script setup lang="ts">

import AddFriendComponent from "~/components/friendList/AddFriendComponent.vue";

const sessionState = useState('session')
const config = useRuntimeConfig()

let incoming = ref<FriendRequest[]>([])
let outgoing = ref<FriendRequest[]>([])
let loaded = ref(false)

interface FriendRequest {
  sender: {
    userId: string,
    username: string,
    createdAt: number
  }
  recipient: {
    userId: string,
    username: string,
    createdAt: number
  },
  createdAt: number
}

async function loadFriendRequests() {
  const session = sessionState.value as any

  const res = await $fetch(config.public.apiBaseUrl + "/user/me/friends/requests", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.session.accessToken}`,
      Session: session.session.sessionId
    }
  })

  const data = res as any

  outgoing.value = data.out as FriendRequest[]
  incoming.value = data.in as FriendRequest[]
  loaded.value = true
  console.log(res)
}

onMounted(() => {
  loadFriendRequests()
})

async function cancelRequest(request: FriendRequest) {
  const session = sessionState.value as any
  let userId = request.sender.userId
  if (userId === session.user.userId) userId = request.recipient.userId

  const res = await $fetch(config.public.apiBaseUrl + "/user/" + userId + "/friends", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.session.accessToken}`,
      Session: session.session.sessionId
    }
  })

  await loadFriendRequests()
}

async function acceptRequest(request: FriendRequest) {
  const session = sessionState.value as any
  let userId = request.sender.userId

  const res = await $fetch(config.public.apiBaseUrl + "/user/" + userId + "/friends", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.session.accessToken}`,
      Session: session.session.sessionId
    }
  })

  await loadFriendRequests()
}

</script>

<template>
  <AddFriendComponent @send="loadFriendRequests"/>
  <div v-if="loaded">
    <div class="p-4">
      <div class="h-12 items-center p-2">
        <p class="font-bold">Incoming Friend Requests - {{ incoming.length || 0 }}</p>
      </div>
      <div v-for="request in incoming" :key="request.sender.userId">
        <USeparator/>
        <div class="items-center p-2 py-4 flex gap-2 transition-colors hover:bg-muted rounded-lg">
          <UAvatar src="https://images.dog.ceo/breeds/dingo/n02115641_1380.jpg" size="3xl"/>
          <div class="flex flex-col flex-1">
            <p class="font-bold">{{ request.sender.username }}</p>
            <p class="text-[var(--ui-text-muted)]">Online</p>
          </div>
          <UFieldGroup size="lg">
            <UTooltip :delay-duration="0" text="Accept">
              <UButton @click="acceptRequest(request)" variant="subtle" color="neutral" icon="material-symbols:check"/>
            </UTooltip>
            <UTooltip :delay-duration="0" text="Decline">
              <UButton @click="cancelRequest(request)" variant="subtle" color="neutral" icon="material-symbols:close"/>
            </UTooltip>
          </UFieldGroup>
        </div>
      </div>
    </div>
    <div class="p-4">
      <div class="h-12 items-center p-2">
        <p class="font-bold">Outgoing Friend Requests - {{ outgoing.length || 0 }}</p>
      </div>
      <div v-for="request in outgoing" :key="request.sender.userId">
        <USeparator/>
        <div class="items-center p-2 py-4 flex gap-2 transition-colors hover:bg-muted rounded-lg">
          <UAvatar src="https://images.dog.ceo/breeds/dingo/n02115641_1380.jpg" size="3xl"/>
          <div class="flex flex-col flex-1">
            <p class="font-bold">{{ request.recipient.username }}</p>
            <p class="text-[var(--ui-text-muted)]">Online</p>
          </div>
          <UFieldGroup size="lg">
            <UTooltip :delay-duration="0" text="Cancel">
              <UButton @click="cancelRequest(request)" variant="subtle" color="neutral" icon="material-symbols:close"/>
            </UTooltip>
          </UFieldGroup>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="p-4">
      <div class="h-12 items-center p-2">
        <USkeleton class="h-4 w-32"/>
      </div>
      <div v-for="i in 10">
        <USeparator/>
        <div class=" items-center p-2 flex gap-2">
          <USkeleton class="size-12 rounded-full"/>
          <div class="flex flex-col gap-2">
            <USkeleton class="h-4 w-3xs"/>
            <USkeleton class="h-4 w-3xs"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
