<script setup>

const { $axios } = useNuxtApp()
const session = useState('session', () => null)

onMounted(async () => {
  try {
    const res = await $axios.post('/auth/session/refresh')

    if (res.status !== 200) {
      await navigateTo({path: '/login'});
      return;
    }

    session.value = {
      session: res.data,
    }

    console.log(session.value.session.sessionId)

    const meRes = await $axios.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      }
    })

    if (meRes.status !== 200) {
      await navigateTo({path: '/login'});
      return;
    }

    session.value.user = meRes.data;

    await navigateTo('/home')

  } catch (e) {
    await navigateTo({path: '/login'});
  }
})

</script>

<template>
  <p class="text-[var(--text-primary)]">Loading...</p>
</template>

<style scoped>

</style>