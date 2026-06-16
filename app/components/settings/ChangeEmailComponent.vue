<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

const config = useRuntimeConfig()
const sessionState = useState<any>('session')
const currentEmail = computed(() => sessionState?.value?.user?.email || 'your email')
const toast = useToast()
const { $refreshUser } = useNuxtApp()

const open = ref(false)
const step = ref(1)
const newEmail = ref('')
const loading = ref(false)
const errorMessage = ref('')

// --- Step 1: Enter new email ---
const step1Schema = v.object({
  newEmail: v.pipe(v.string(), v.email('Invalid email address')),
  password: v.pipe(v.string(), v.minLength(1, 'Password is required'))
})

type Step1Schema = v.InferOutput<typeof step1Schema>

const step1State = reactive({
  newEmail: '',
  password: ''
})

async function onStep1Submit(event: FormSubmitEvent<Step1Schema>) {
  if (event.data.newEmail === sessionState.value.user.email) {
    errorMessage.value = 'New email must be different from your current email'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch(config.public.apiBaseUrl + '/settings/email/request', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionState.value.session.accessToken}`,
        Session: sessionState.value.session.sessionId
      },
      body: {
        newEmail: event.data.newEmail,
        password: event.data.password
      }
    })

    newEmail.value = event.data.newEmail
    toast.add({ title: 'Verification code sent', description: 'A 6-digit code has been sent to your current email address.', color: 'success' })
    step.value = 2
    errorMessage.value = ''
    loading.value = false
  } catch (e: any) {
    const error = e as any
    if (error.data?.error) {
      errorMessage.value = error.data.error
    } else {
      toast.add({ title: 'Error', description: 'Failed to send verification code. Please try again.', color: 'error' })
    }
    loading.value = false
  }
}

// --- Step 2: Verify old email code ---
const step2Code = ref<number[]>([])
const step2Disabled = ref(false)

async function onStep2Complete(value: number[]) {
  const code = value.join('')
  step2Disabled.value = true
  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch(config.public.apiBaseUrl + '/settings/email/verify-old', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionState.value.session.accessToken}`,
        Session: sessionState.value.session.sessionId
      },
      body: { code }
    })

    toast.add({ title: 'Verification code sent', description: 'A 6-digit code has been sent to your new email address.', color: 'success' })
    step.value = 3
    errorMessage.value = ''
    loading.value = false
    step2Disabled.value = false
  } catch (e: any) {
    const error = e as any
    step2Code.value = []
    step2Disabled.value = false
    if (error.data?.error) {
      errorMessage.value = error.data.error
    } else {
      toast.add({ title: 'Error', description: 'Invalid verification code. Please try again.', color: 'error' })
    }
    loading.value = false
  }
}

// --- Step 3: Verify new email code ---
const step3Code = ref<number[]>([])
const step3Disabled = ref(false)

async function onStep3Complete(value: number[]) {
  const code = value.join('')
  step3Disabled.value = true
  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch(config.public.apiBaseUrl + '/settings/email/verify-new', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionState.value.session.accessToken}`,
        Session: sessionState.value.session.sessionId
      },
      body: {
        code,
        newEmail: newEmail.value
      }
    })

    toast.add({ title: 'Email changed', description: 'Your email address has been updated successfully.', color: 'success' })
    await $refreshUser()
    closeModal()
  } catch (e: any) {
    const error = e as any
    step3Code.value = []
    step3Disabled.value = false
    if (error.data?.error) {
      errorMessage.value = error.data.error
    } else {
      toast.add({ title: 'Error', description: 'Invalid verification code. Please try again.', color: 'error' })
    }
    loading.value = false
  }
}

function goBack() {
  errorMessage.value = ''
  step2Code.value = []
  step3Code.value = []
  step2Disabled.value = false
  step3Disabled.value = false
  if (step.value === 2) {
    step.value = 1
  } else if (step.value === 3) {
    step.value = 2
  }
}

function closeModal() {
  open.value = false
  step.value = 1
  newEmail.value = ''
  errorMessage.value = ''
  loading.value = false
  step1State.newEmail = ''
  step1State.password = ''
  step2Code.value = []
  step3Code.value = []
  step2Disabled.value = false
  step3Disabled.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <slot />
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="material-symbols:mail-outline" size="24" />
            <h2 class="text-xl font-bold">Change Email Address</h2>
          </div>
        </template>

        <template #default>
          <!-- Step 1: Enter new email -->
          <div v-if="step === 1" class="flex flex-col gap-4">
            <p class="text-muted text-sm">Enter your new email address and your current password to begin the verification process.</p>

            <UForm :schema="step1Schema" :state="step1State" @submit="onStep1Submit" class="flex flex-col gap-4">
              <UFormField label="New Email Address" name="newEmail">
                <UInput v-model="step1State.newEmail" type="email" class="w-full" size="xl" placeholder="new@example.com" />
              </UFormField>

              <UFormField label="Current Password" name="password">
                <UInput v-model="step1State.password" type="password" class="w-full" size="xl" />
              </UFormField>

              <p v-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>

              <UButton type="submit" label="Send Verification Code" :loading="loading" block />
            </UForm>
          </div>

          <!-- Step 2: Verify old email code -->
          <div v-if="step === 2" class="flex flex-col gap-4">
            <p class="text-muted text-sm">Enter the 6-digit code sent to <strong>{{ currentEmail }}</strong>.</p>

            <div class="flex justify-center my-4">
              <UPinInput v-model="step2Code" :disabled="step2Disabled" @complete="onStep2Complete" otp length="6" size="xl" type="number" autofocus />
            </div>

            <p v-if="errorMessage" class="text-error text-sm text-center">{{ errorMessage }}</p>

            <div class="flex gap-2">
              <UButton @click="goBack" label="Back" color="neutral" variant="outline" />
            </div>
          </div>

          <!-- Step 3: Verify new email code -->
          <div v-if="step === 3" class="flex flex-col gap-4">
            <p class="text-muted text-sm">Enter the 6-digit code sent to <strong>{{ newEmail }}</strong>.</p>

            <div class="flex justify-center my-4">
              <UPinInput v-model="step3Code" :disabled="step3Disabled" @complete="onStep3Complete" otp length="6" size="xl" type="number" autofocus />
            </div>

            <p v-if="errorMessage" class="text-error text-sm text-center">{{ errorMessage }}</p>

            <div class="flex gap-2">
              <UButton @click="goBack" label="Back" color="neutral" variant="outline" />
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
