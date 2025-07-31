<script setup lang="ts">

import AddFriendComponent from "~/components/friendList/AddFriendComponent.vue";
import type { TabsItem } from '@nuxt/ui'
import AllFriendsListComponent from "~/components/friendList/AllFriendsListComponent.vue";
import FriendRequestsComponent from "~/components/friendList/FriendRequestsComponent.vue";

const sessionState = useState('session') as any
const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()


const items = ref<TabsItem[]>([
  {
    label: 'Online',
    icon: 'material-symbols:group',
    slot: 'onlineFriends' as const
  },
  {
    label: 'All',
    icon: 'material-symbols:group-outline',
    slot: 'allFriends' as const
  },
  {
    label: 'Friend Requests',
    icon: 'material-symbols:group-add',
    slot: 'friendRequests' as const
  }
])


</script>

<template>
  <div class="flex-col flex h-full justify-between">
    <UCard variant="subtle" class="shrink-0">
      <p class="text-xl font-bold">Friends</p>
    </UCard>

    <UTabs :items="items" class="w-full mt-2 flex-1 overflow-auto" :ui="{ content: 'focus:outline-none w-full overflow-auto' }">
      <template #onlineFriends="{ item }">

      </template>
      <template #allFriends="{ item }">
        <AllFriendsListComponent />
      </template>
      <template #friendRequests="{ item }">
        <FriendRequestsComponent/>
      </template>
    </UTabs>
  </div>
</template>

<style scoped>

</style>