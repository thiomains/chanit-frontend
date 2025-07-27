<script setup>

import AddFriendComponent from "~/components/friendList/AddFriendComponent.vue";

const {$axios} = useNuxtApp()
const session = useState('session')
const nuxtApp = useNuxtApp()

let data = ref([]);
let friendsLoaded = ref(false)

async function loadFriends() {
  const res = await $axios.get('/user/me/friends', {
    headers: {
      Authorization: `Bearer ${session.value.session.accessToken}`,
      Session: session.value.session.sessionId
    }
  })

  data.value = res.data
  friendsLoaded.value = true
}

nuxtApp.hook('app:session:refresh', () => {
  loadFriends()
})

</script>

<template>
  <div class="w-full p-4 flex flex-col gap-1 text-center">
    <div class="flex justify-between items-center p-2">
      <h2 class="text-xl font-bold">Friends</h2>
      <AddFriendComponent/>
    </div>
    <div v-if="friendsLoaded">
      <div class="flex flex-col gap-1" v-for="friend in data">
        <FriendListFriendComponent :friend="friend"/>
      </div>
      <p v-if="data.length === 0">No friends yet. :(</p>
    </div>
    <div v-else v-for="i in 10">
      <div class="flex gap-2 items-center">
        <USkeleton class="h-12 w-12 rounded-full" />
        <USkeleton class="my-1 h-4 w-36 rounded-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>