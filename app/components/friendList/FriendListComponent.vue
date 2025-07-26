<script setup>

import AddFriendComponent from "~/components/friendList/AddFriendComponent.vue";

const { $axios } = useNuxtApp()
const session = useState('session')

let data = ref([]);

async function refreshFriends() {
  const res = await $axios.get('/user/me/friends', {
    headers: {
      Authorization: `Bearer ${session.value.session.accessToken}`,
      Session: session.value.session.sessionId
    }
  })

  data.value = res.data
}

onMounted(() => {
  refreshFriends()
})

</script>

<template>
  <div class="w-full p-4 flex flex-col gap-1 text-center">
    <div class="flex justify-between items-center p-2">
      <h2 class="text-xl font-bold">Friends</h2>
      <AddFriendComponent />
    </div>
    <div class="flex flex-col gap-1" v-for="friend in data">
      <FriendListFriendComponent :friend="friend" />
    </div>
    <p v-if="data.length === 0">No friends yet. :(</p>
  </div>
</template>

<style scoped>

</style>