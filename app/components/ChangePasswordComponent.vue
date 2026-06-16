<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

const config = useRuntimeConfig()
const sessionState = useState<any>('session')
const toast = useToast()

const schema = v.object({
  currentPassword: v.pipe(v.string(), v.minLength(1, 'Current password is required')),
  newPassword: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters')),
  confirmPassword: v.string()
})

type Schema = v.InferOutput<typeof schema>

const state = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (event.data.newPassword !== event.data.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch(config.public.apiBaseUrl + '/settings/password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionState.value.session.accessToken}`,
        Session: sessionState.value.session.sessionId
      },
      body: {
        currentPassword: event.data.currentPassword,
        newPassword: event.data.newPassword
      }
    })

    toast.add({ title: 'Password changed', description: 'Please log in again with your new password.', color: 'success' })

    sessionState.value.session = null
    sessionState.value.user = null

    await navigateTo('/login')
    window.location.reload()
  } catch (e: any) {
    const error = e as any
    if (error.data?.error) {
      errorMessage.value = error.data.error
    } else {
      toast.add({ title: 'Error', description: 'Failed to change password. Please try again.', color: 'error' })
    }
    loading.value = false
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit" class="flex flex-col gap-4">
    <UFormField label="Current Password" name="currentPassword">
      <UInput v-model="state.currentPassword" type="password" class="w-full" size="xl" />
    </UFormField>

    <UFormField label="New Password" name="newPassword">
      <UInput v-model="state.newPassword" type="password" class="w-full" size="xl" />
    </UFormField>

    <UFormField label="Confirm New Password" name="confirmPassword">
      <UInput v-model="state.confirmPassword" type="password" class="w-full" size="xl" />
    </UFormField>

    <p class="text-muted text-sm">All your active sessions will be logged out after changing your password.</p>

    <p v-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>

    <UButton type="submit" label="Change Password" class="w-fit" :loading="loading" />
  </UForm>
</template>
