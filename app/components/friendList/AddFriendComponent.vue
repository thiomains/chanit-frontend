<script setup lang="ts">

const sessionState = useState('session') as any
const nuxtApp = useNuxtApp()
const config = useRuntimeConfig()
const emit = defineEmits(['send'])

async function addFriend() {
  let name = username.value
  name = name.trim()
  if (name === "") return
  addFriendsDisabled.value = true
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/user/" + name + "/friends", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionState.value.session.accessToken}`,
        Session: sessionState.value.session.sessionId
      }
    }) as any

    username.value = ""
    addFriendsDisabled.value = false
    errorMessage.value = res.message
    messageColor.value = "text-success"
    emit("send", res)
  } catch (e) {
    const error = e as any
    addFriendsDisabled.value = false
    errorMessage.value = error.data.error
    messageColor.value = "text-error"
  }
}

let username = ref("")
let addFriendsDisabled = ref(false)
let messageColor = ref("text")
let errorMessage = ref("")

</script>

<template>
  <UCard class="m-1">
    <UButtonGroup class="w-full" size="lg">
      <UInput class="w-full" color="primary" placeholder="Enter a username..." v-model="username" autocomplete="off"/>
      <UButton :disabled="addFriendsDisabled" @click="addFriend" label="Add Friend" icon="material-symbols:person-add" />
    </UButtonGroup>
    <p v-if="errorMessage !== ''" class="mt-4" :class="messageColor" >{{ errorMessage }}</p>
  </UCard>
</template>

<style scoped>


</style>