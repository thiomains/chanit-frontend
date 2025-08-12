<script setup lang="ts">

</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <p class="text-sm">Current Password</p>
      <UInput type="password" class="w-full" size="xl" />
    </div>
    <div>
      <p class="text-sm">New Password</p>
      <UInput class="w-full" size="xl" />
    </div>
    <div>
      <p class="text-sm">Confirm New Password</p>
      <UInput class="w-full" size="xl" />
    </div>
    <p class="text-muted">All your devices will be logged out. </p>
    <UButton label="Update Password" class="w-fit" />
  </div>
</template>

<style scoped>

</style>