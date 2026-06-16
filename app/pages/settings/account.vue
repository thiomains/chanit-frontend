<script setup lang="ts">
import DataRequestModal from "~/components/settings/DataRequestModal.vue";
import DeleteAccountModal from "~/components/settings/DeleteAccountModal.vue";
import ChangeEmailComponent from "~/components/settings/ChangeEmailComponent.vue";

definePageMeta({
  layout: 'settings'
})

interface SessionData {
  session: { accessToken: string; sessionId: string; expiresAt: number } | null
  user: { email: string; username: string; loginName: string; profilePictureUrl: string; bio: string } | null
}

const sessionState = useState<SessionData>('session')
const userEmail = computed(() => sessionState.value?.user?.email || 'No email')
</script>

<template>
  <div class="flex-col flex gap-6">
    <h1 class="text-2xl font-bold">Account Settings</h1>

    <!-- Login Information -->
    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Login Information</h2>
      <USeparator />

      <!-- Email -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium">Email Address</p>
          <p class="text-dimmed text-sm">{{ userEmail }}</p>
        </div>
        <ChangeEmailComponent>
          <UButton label="Change Email" variant="outline" />
        </ChangeEmailComponent>
      </div>
    </section>

    <!-- Password -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium">Password</p>
        <p class="text-dimmed text-sm">••••••••</p>
      </div>
      <UModal title="Change Password">
        <UButton label="Change Password" variant="outline" />
        <template #body>
          <ChangePasswordComponent />
        </template>
      </UModal>
    </div>

    <!-- Data Request -->
    <section class="flex flex-col gap-4">
      <h2 class="text-xl font-semibold">Data Request</h2>
      <USeparator />
      <p class="text-muted max-w-3/5">You can download a copy of your personal data and all information associated to you.</p>
      <div class="inline-flex gap-2">
        <DataRequestModal>
          <UButton label="Request My Data" variant="solid" />
        </DataRequestModal>
        <DeleteAccountModal>
          <UButton label="Delete My Account" color="error" variant="soft" />
        </DeleteAccountModal>
      </div>
    </section>
  </div>
</template>

<style scoped>

</style>
