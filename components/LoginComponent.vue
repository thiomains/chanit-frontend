<script setup>

const { $axios } = useNuxtApp()

let mailAddress = ref('')
let password = ref('')

let error = ref('')

async function login() {

  if (mailAddress.value === '') {
    error.value = 'Please enter an email address.';
    return;
  }

  if (password.value === '') {
    error.value = 'Please enter a password.';
    return;
  }

  try {
    const res = await $axios.post('/auth/login', {
      email: mailAddress.value,
      password: password.value
    })

    if (res.status !== 200) {
      error.value = res.data.error;
      return;
    }

    await navigateTo('/app')
  } catch (e) {
    error.value = e.response.data.error;
  }
}


</script>

<template>
  <h1 class="text-[var(--text-primary)] text-2xl font-bold leading-none">Log In</h1>
  <div class="w-full my-4 flex flex-col gap-2">
    <p v-if="error !== ''" class="text-[var(--text-red)] underline">{{ error }}</p>
    <div>
      <h3 class="text-[var(--text-secondary)]">E-Mail</h3>
      <input class="border-[var(--text-secondary)] border-2 rounded-lg text-[var(--text-secondary)] p-2" type="text" v-model="mailAddress">
    </div>
    <div>
      <h3 class="text-[var(--text-secondary)]">Password</h3>
      <input class="border-[var(--text-secondary)] border-2 rounded-lg text-[var(--text-secondary)] p-2" type="password" v-model="password">
    </div>
  </div>
  <button @click="login" class="cursor-pointer text-[var(--text-primary)] font-bold text-center w-full bg-[var(--bg-light)] p-2 rounded-lg">Log In</button>
</template>

<style scoped>

</style>