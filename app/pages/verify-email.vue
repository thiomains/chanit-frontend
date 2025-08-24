<script setup lang="ts">
let errorMsg = ref("")
let inputDisabled = ref(false)
const config = useRuntimeConfig()
const session = useState("session")
let inputValue = ref([])
const { $refreshUser } = useNuxtApp()

async function inputComplete() {
  inputDisabled.value = true
  let userSession = session.value as {
    session: {
      accessToken: string,
      sessionId: string
    }
  }
  let code = inputValue.value.join('')
  try {
    const res = await $fetch(config.public.apiBaseUrl + '/auth/verification-code/verify', {
      method: "POST",
      body: {
        code: code
      },
      headers: {
        Authorization: `Bearer ${userSession.session.accessToken}`,
        Session: userSession.session.sessionId
      }
    })

    await $refreshUser()

    await navigateTo({
      path: "/"
    })
  } catch (e) {
    let error = e as any
    errorMsg.value = error.data.error
    if (error.data.error === "Account e-mail address already verified") {
      navigateTo({
        path: "/"
      })
    }
    inputDisabled.value = false
  }
}

async function resendCode() {
  let userSession = session.value as {
    session: {
      accessToken: string,
      sessionId: string
    }
  }
  try {
    const res = await $fetch(config.public.apiBaseUrl + '/auth/verification-code', {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userSession.session.accessToken}`,
        Session: userSession.session.sessionId
      }
    })
  } catch (e) {
    let error = e as any
    console.log(error.data.error)
  }
}

</script>

<template>
  <div class="w-screen h-screen flex items-center justify-center">
    <UCard>
      <template #header>
        <h1 class="font-bold">Verify Your E-Mail Address</h1>
      </template>

      <p class="text-muted">A verification code was sent to your E-Mail Address</p>

      <div class="flex items-center gap-2 my-12 flex-col">
        <UPinInput v-model="inputValue" :disabled="inputDisabled" @complete="inputComplete" otp length="6" size="xl" type="number" autofocus />
        <p class="text-error">{{ errorMsg }}</p>
      </div>

      <p class="text-dimmed text-sm mt-2 text-center">Please check your spam folder if you haven't received the email</p>
      <ULink @click="resendCode" as="button" class="text-sm">Send another code</ULink>
    </UCard>
  </div>
</template>

<style scoped>

</style>