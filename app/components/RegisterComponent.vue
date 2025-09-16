<script setup lang="ts">

import * as v from 'valibot'
import type {FormSubmitEvent} from '@nuxt/ui'

const config = useRuntimeConfig()
const { $checkToken } = useNuxtApp()

const schema = v.object({
  username: v.pipe(v.string(), v.minLength(3, 'Must be at least 3 characters'), v.maxLength(16, 'Must be no longer than 16 characters')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters'))
})

type Schema = v.InferOutput<typeof schema>

const state = reactive({
  username: '',
  email: '',
  password: ''
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  await register(event.data.username, event.data.email, event.data.password)
}

async function register(username: string, email: string, password: string) {

  try {
    const res = await $fetch(config.public.apiBaseUrl + '/auth/register', {
      method: "POST",
      body: {
        username: username,
        email: email,
        password: password
      },
      credentials: "include"
    })

    await navigateTo({
      path: '/app'
    })
    window.location.reload()
  } catch (e) {
    const error = e as any
    console.log(error.data.error)
    toast.add({ title: 'Login failed', description: error.data.error, color: 'error' })
  }
}

async function faserLogin() {
  window.location.href = "https://faser.app/oauth/?client_id=a730mf1oeiuof3rbbec1z&redirect_uri=" + window.location.origin + "/auth&scopes=69"
}

</script>

<template>

  <UCard variant="subtle" class="min-w-sm">
    <template #header>
      <h1 class="text-2xl">Register</h1>
    </template>

    <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-4">
      <UFormField label="Username" name="username">
        <UInput v-model="state.username" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Email" name="email">
        <UInput v-model="state.email" class="w-full" size="xl" />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput v-model="state.password" type="password" class="w-full" size="xl" />
      </UFormField>

      <UButton type="submit" label="Create your account" block size="xl" />

    </UForm>

    <USeparator class="my-2" label="or" />

    <UButton
        @click="faserLogin"
        variant="subtle"
        :avatar="{
            src: 'https://cdn.faser.app/faser/static/logo.png?size=32'
          }"
        label="Log in with faser"
        block
        size="xl"
        class="text-faser ring ring-inset ring-faser/25 bg-faser/10 hover:bg-faser/15 active:bg-faser/15 disabled:bg-faser/10 aria-disabled:bg-faser/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-faser"
    />

  </UCard>

</template>

<style scoped>

</style>