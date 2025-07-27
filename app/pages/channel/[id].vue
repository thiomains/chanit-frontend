<script setup>

const config = useRuntimeConfig()
const route = useRoute()
const session = useState('session')
const { $checkToken } = useNuxtApp()

onMounted(async () => {

  try {
    sose.value = await $fetch(config.public.apiBaseUrl + "/channel/" + route.params.id, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      }
    })
  } catch (e) {
    console.log(e)
  }

  try {
    messages.value = await $fetch(config.public.apiBaseUrl + "/channel/" + route.params.id + "/messages", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      }
    })
  } catch (e) {
    console.log(e)
  }

})

let sose = ref('')

let messages = ref([])

</script>

<template>
  <div class="size-full">
    <p>{{ sose }}</p>
  </div>
  <TextChannelInputComponent />
</template>

<style scoped>

</style>