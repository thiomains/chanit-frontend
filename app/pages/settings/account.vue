<script setup lang="ts">
definePageMeta({
  layout: 'settings'
})


</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">Account Settings</h1>
    <div class="my-4">
      <h2 class="text-xl mb-2">Log In Information</h2>
      <UModal title="Change Password">
        <UButton label="Change Password" />

        <template #body>
          <ChangePasswordComponent />
        </template>
      </UModal>

    </div>
  </div>
</template>

<style scoped>

</style>