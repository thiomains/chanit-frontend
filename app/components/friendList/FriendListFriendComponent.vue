<script setup>
const { $axios } = useNuxtApp()
const props = defineProps(['friend'])
const session = useState('session')

async function chatClick() {
  await navigateTo({
    path: '/channel/direct-message/' + props.friend.user.userId
  })
}

async function removeFriendClick() {
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
    <CircleButtonComponent icon="chat" @click="chatClick" />
    <CircleButtonComponent icon="person_off" @click="removeFriendClick"/>
  </div>
</template>

<style scoped>

</style>