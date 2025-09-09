<script setup lang="ts">

const sessionState = useState("session")
const session = sessionState.value as {
  user: {
    username: string,
    profilePictureUrl: string,
  }
}

function avatarUrl() {
  let url = session.user.profilePictureUrl
  url = url ? url : "https://images.dog.ceo/breeds/hound-walker/n02089867_2596.jpg"
  url = url + "?max=40"
  return url
}

let username = ref(session.user.username)

const route = useRoute()

</script>

<template>
  <div class="border border-default p-3 rounded-md flex items-center gap-2">
    <UAvatar :src="avatarUrl()" size="xl" />
    <p class="font-bold">{{ username }}</p>
    <UButton :to="'/settings/account?back=' + route.path" class="ml-auto" icon="material-symbols:settings" variant="ghost" color="neutral" />
  </div>
</template>

<style scoped>

</style>