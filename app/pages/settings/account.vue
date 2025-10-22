<script setup lang="ts">
import DataRequestModal from "~/components/settings/DataRequestModal.vue";

definePageMeta({
  layout: 'settings'
})


</script>

<template>
  <div class="flex-col flex gap-4">
    <h1 class="text-2xl font-bold">Account Settings</h1>
    <div>
      <section hidden>
        <h2 class="text-xl">Log In Information</h2>
        <UModal title="Change Password" class="my-2">
          <UButton label="Change Password" />

          <template #body>
            <ChangePasswordComponent />
          </template>
        </UModal>

      </section>
    </div>
    <section>
      <h2 class="text-xl">Data Request</h2>
      <p class="text-muted max-w-3/5">You can download a copy of your personal data and all information associated to you. </p>
      <div class="inline-flex gap-2 my-2">
        <DataRequestModal>
          <UButton label="Request My Data" variant="solid"/>
        </DataRequestModal>
        <UButton label="Delete My Account" color="error" variant="soft" hidden/>
      </div>
    </section>
  </div>
</template>

<style scoped>

</style>