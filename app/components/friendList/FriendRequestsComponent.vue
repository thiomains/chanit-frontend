<script setup lang="ts">

</script>

<template>
  <script setup lang="ts">

    const sessionState = useState('session')
    const config = useRuntimeConfig()

    let data = ref<FriendRequest[]>([])
    let loaded = ref(false)

    interface FriendRequest {
      sender: string,
      recipient: string,
      createdAt: number
    }

    async function loadFriends() {
      const session = sessionState.value as any

      const res = await $fetch(config.public.apiBaseUrl + "/user/me/friends/requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.session.accessToken}`,
          Session: session.session.sessionId
        }
      })

      data.value = res as FriendRequest[]
      loaded.value = true
    }

    onMounted(() => {
      loadFriends()
    })

  </script>

  <template>
    <div v-if="friendsLoaded">
      <div class="p-4">
        <div class="h-12 items-center p-2">
          <p class="font-bold">All Friends - {{ friends.length }}</p>
        </div>
        <div v-for="friend in friends" :key="friend.user.userId">
          <USeparator />
          <div class="items-center p-2 py-4 flex gap-2 transition-colors hover:bg-muted rounded-lg">
            <UAvatar src="https://images.dog.ceo/breeds/dingo/n02115641_1380.jpg" size="3xl"/>
            <div class="flex flex-col flex-1">
              <p class="font-bold">{{ friend.user.username }}</p>
              <p class="text-[var(--ui-text-muted)]">Online</p>
            </div>
            <UButtonGroup size="lg">
              <UTooltip :delay-duration="0" text="Direct Message">
                <UButton :href="'/channel/' + friend.directChannelId" variant="subtle" color="neutral" icon="material-symbols:chat" />
              </UTooltip>
              <UTooltip :delay-duration="0" text="Start Voice Call">
                <UButton variant="subtle" color="neutral" icon="material-symbols:call" />
              </UTooltip>
            </UButtonGroup>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="p-4">
        <div class="h-12 items-center p-2">
          <USkeleton class="h-4 w-32" />
        </div>
        <div v-for="i in 10">
          <USeparator />
          <div class=" items-center p-2 flex gap-2">
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
</template>

<style scoped>

</style>