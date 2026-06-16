<script setup lang="ts">
import * as v from 'valibot'

const config = useRuntimeConfig()
const sessionState = useState<any>('session')
const toast = useToast()

const open = ref(false)
const phase = ref(1)
const loading = ref(false)
const errorMessage = ref('')

// --- Phase 1: Warning + Password ---
const phase1Schema = v.object({
  password: v.pipe(v.string(), v.minLength(1, 'Password is required'))
})

const phase1State = reactive({
  password: ''
})

async function requestDeletionCode() {
  const result = v.safeParse(phase1Schema, phase1State)
  if (!result.success) {
    errorMessage.value = result.issues[0]?.message || 'Please fill in all required fields'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch(config.public.apiBaseUrl + '/settings/delete/request', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionState.value.session.accessToken}`,
        Session: sessionState.value.session.sessionId
      },
      body: {
        password: phase1State.password
      }
    })

    toast.add({ title: 'Deletion code sent', description: 'A 6-digit code has been sent to your email address.', color: 'info' })
    phase.value = 2
    errorMessage.value = ''
    loading.value = false
  } catch (e: any) {
    const error = e as any
    if (error.data?.error) {
      errorMessage.value = error.data.error
    } else {
      toast.add({ title: 'Error', description: 'Failed to request deletion code. Please try again.', color: 'error' })
    }
    loading.value = false
  }
}

// --- Phase 2: Code + Final Confirmation ---
const phase2Schema = v.object({
  code: v.pipe(v.string(), v.regex(/^\d{6}$/, 'Must be a 6-digit code')),
  password: v.pipe(v.string(), v.minLength(1, 'Password is required'))
})

const phase2State = reactive({
  code: '',
  password: '',
  confirmed: false
})

async function confirmDeletion() {
  if (!phase2State.confirmed) {
    errorMessage.value = 'You must confirm this action'
    return
  }

  const result = v.safeParse(phase2Schema, phase2State)
  if (!result.success) {
    errorMessage.value = result.issues[0]?.message || 'Please fill in all required fields'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await $fetch(config.public.apiBaseUrl + '/settings/delete', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionState.value.session.accessToken}`,
        Session: sessionState.value.session.sessionId
      },
      body: {
        password: phase2State.password,
        code: phase2State.code
      }
    })

    toast.add({ title: 'Account deleted', description: 'Your account has been permanently deleted.', color: 'info' })

    sessionState.value.session = null
    sessionState.value.user = null

    await navigateTo('/login')
    window.location.reload()
  } catch (e: any) {
    const error = e as any
    if (error.data?.error) {
      errorMessage.value = error.data.error
    } else {
      toast.add({ title: 'Error', description: 'Failed to delete account. Please try again.', color: 'error' })
    }
    loading.value = false
  }
}

function closeModal() {
  if (loading.value) return
  open.value = false
  phase.value = 1
  errorMessage.value = ''
  phase1State.password = ''
  phase2State.code = ''
  phase2State.password = ''
  phase2State.confirmed = false
}
</script>

<template>
  <UModal v-model:open="open" :close="false">
    <slot />
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="material-symbols:warning-outline-rounded" class="text-error" size="24" />
            <h2 class="text-xl font-bold text-error">Delete Account</h2>
          </div>
        </template>

        <template #default>
          <!-- Phase 1: Warning + Password -->
          <div v-if="phase === 1" class="flex flex-col gap-4">
            <div class="bg-error/10 border border-error/30 rounded-lg p-4">
              <p class="text-error font-semibold">This action is permanent and cannot be undone!</p>
            </div>

            <div>
              <p class="text-sm text-muted mb-2">The following will be permanently deleted:</p>
              <ul class="text-sm text-muted list-disc list-inside space-y-1">
                <li>All your messages and attachments</li>
                <li>All your notifications</li>
                <li>All friend connections and requests</li>
                <li>Your profile and avatar</li>
                <li>Your account permanently</li>
              </ul>
            </div>

            <div>
              <p class="text-sm text-muted mb-1">Enter your password to continue</p>
              <UInput v-model="phase1State.password" type="password" class="w-full" size="xl" />
            </div>

            <p v-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Phase 2: Code + Final Confirmation -->
          <div v-if="phase === 2" class="flex flex-col gap-4">
            <p class="text-muted text-sm">Enter the 6-digit deletion code sent to your email address.</p>

            <div>
              <p class="text-sm text-muted mb-1">Deletion Code</p>
              <UInput v-model="phase2State.code" class="w-full" size="xl" maxlength="6" placeholder="000000" />
            </div>

            <div>
              <p class="text-sm text-muted mb-1">Re-enter your password</p>
              <UInput v-model="phase2State.password" type="password" class="w-full" size="xl" />
            </div>

            <UCheckbox v-model="phase2State.confirmed" label="I understand this action is permanent and all my data will be deleted" />

            <p v-if="errorMessage" class="text-error text-sm">{{ errorMessage }}</p>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-end gap-2 w-full">
            <UButton @click="closeModal" label="Cancel" color="neutral" variant="subtle" :disabled="loading" />
            <UButton
              v-if="phase === 1"
              @click="requestDeletionCode"
              label="Request Deletion Code"
              color="error"
              :loading="loading"
            />
            <UButton
              v-if="phase === 2"
              @click="confirmDeletion"
              label="Permanently Delete My Account"
              color="error"
              variant="solid"
              :loading="loading"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
