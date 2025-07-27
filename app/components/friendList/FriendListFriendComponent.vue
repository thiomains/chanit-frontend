<script setup>
const { $axios } = useNuxtApp()
const props = defineProps(['friend'])
const session = useState('session')
const { $checkToken } = useNuxtApp()

async function chatClick() {
  await navigateTo({
    path: '/channel/' + props.friend.directChannelId
  })
}

async function removeFriendClick() {

  if (!$checkToken()) return

  const res = await $axios.delete('/user/' + props.friend.user.userId + '/friends', {
    headers: {
      Authorization: `Bearer ${session.value.session.accessToken}`,
      Session: session.value.session.sessionId
    }
  })
}



</script>

<template>
  <div class="bg-[var(--bg)] p-2 flex justify-between gap-2 w-full h-16 rounded-full">
    <img class="aspect-square h-12 rounded-full"
         src="https://images.dog.ceo/breeds/retriever-chesapeake/n02099849_2153.jpg" alt="dog">
    <p class="w-full">{{ props.friend.user.username }}</p>
    <CircleButtonComponent icon="material-symbols:chat" @click="chatClick" />
    <CircleButtonComponent icon="material-symbols:person-off" @click="removeFriendClick"/>
  </div>
</template>

<style scoped>

</style>