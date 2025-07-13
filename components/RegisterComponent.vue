<script setup>

const { $axios } = useNuxtApp()

let username = ref('')
let mailAddress = ref('')
let password = ref('')

let error = ref('')

async function register() {

  if (username.value === '') {
    error.value = 'Please enter an username.';
    return;
  }

  if (mailAddress.value === '') {
    error.value = 'Please enter an email address.';
    return;
  }

  if (password.value === '') {
    error.value = 'Please enter a password.';
    return;
  }

  try {
    const res = await $axios.post('/auth/register', {
      username: username.value,
      email: mailAddress.value,
      password: password.value
    })

    if (res.status !== 201) {
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
  <h1 class="text-[var(--text-primary)] text-2xl font-bold leading-none">Register</h1>
  <div class="w-full my-4 flex flex-col gap-2">
    <p v-if="error !== ''" class="text-[var(--text-red)] underline">{{ error }}</p>
    <div>
      <h3 class="text-[var(--text-secondary)]">Username</h3>
      <input class="border-[var(--text-secondary)] border-2 rounded-lg text-[var(--text-secondary)] p-2" type="text" v-model="username">
    </div>
    <div>
      <h3 class="text-[var(--text-secondary)]">E-Mail</h3>
      <input class="border-[var(--text-secondary)] border-2 rounded-lg text-[var(--text-secondary)] p-2" type="email" v-model="mailAddress">
    </div>
    <div>
      <h3 class="text-[var(--text-secondary)]">Password</h3>
      <input class="border-[var(--text-secondary)] border-2 rounded-lg text-[var(--text-secondary)] p-2" type="password" v-model="password">
    </div>
  </div>
  <button @click="register" class="cursor-pointer text-[var(--text-secondary)] text-center w-full bg-[var(--bg-light)] p-2 rounded-lg">Create your account</button>
</template>

<style scoped>

</style>