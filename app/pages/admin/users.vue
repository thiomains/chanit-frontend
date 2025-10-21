<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()
const route = useRoute()
const sessionState = useState('session')
const session = sessionState.value as any

interface User {
  id: string,
  username: string,
  email: string,
  createdAt: number,
  active: boolean,
  faserId: number,
  emailVerified: boolean
}

let data = ref<User[]>()

onMounted(async () => {
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/admin/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.session.accessToken}`,
        Session: session.session.sessionId
      }
    })

    data.value = res as User[]

  } catch (e) {
    console.log(e)
  }
})
</script>

<template>
  <UTable :data="data" class="flex-1">

  </UTable>
</template>

<style scoped>

</style>