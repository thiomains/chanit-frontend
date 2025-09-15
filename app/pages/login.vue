<script setup lang="ts">

let registerVisible = ref(false);

const route = useRoute()

function toggleRegisterVisible() {
  registerVisible.value = !registerVisible.value;
}

const { $refreshSession } = useNuxtApp()

onMounted(async () => {
  if (!!route.query.register) {
    registerVisible.value = true;
  }
  const session = await $refreshSession() as {
    error?: {}
  }
  if (!session.error) {
    await navigateTo({
      path: "/app"
    })
    window.location.reload()
  }
})

</script>

<template>
  <div class="flex flex-col justify-center items-center h-screen w-screen">
    <div class="bg-[var(--bg)] p-4 rounded-3xl flex gap-4">
      <div>
        <RegisterComponent v-if="registerVisible" />
        <LoginComponent v-else />
      </div>

    </div>
    <p v-if="registerVisible" class="text-[var(--text-secondary)]">Already a user? <u class="cursor-pointer" @click="toggleRegisterVisible">Log in</u></p>
    <p v-else class="text-[var(--text-secondary)]">No account yet? <u class="cursor-pointer" @click="toggleRegisterVisible">Create one</u></p>
  </div>
</template>

<style scoped>

</style>