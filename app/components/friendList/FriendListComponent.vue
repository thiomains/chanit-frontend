<script setup lang="ts">

import AddFriendComponent from "~/components/friendList/AddFriendComponent.vue";
import type { TabsItem } from '@nuxt/ui'
import AllFriendsListComponent from "~/components/friendList/AllFriendsListComponent.vue";

const {$axios} = useNuxtApp()
const sessionState = useState('session')
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

  <UCard variant="subtle">
    <p class="text-xl font-bold">Friends</p>
  </UCard>

  <UTabs :items="items" class="w-full mt-2">
    <template #onlineFriends="{ item }">

    </template>
    <template #allFriends="{ item }">
      <AllFriendsListComponent />
    </template>
    <template #friendRequests="{ item }">

    </template>
  </UTabs>
</template>

<style scoped>

</style>