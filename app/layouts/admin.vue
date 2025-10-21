<script setup lang="ts">

import type {NavigationMenuItem} from "@nuxt/ui";

const config = useRuntimeConfig()
const sessionState = useState('session')
const session = sessionState.value as any

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Back to app',
      icon: 'material-symbols:arrow-back-ios-new-rounded',
      to: '/app'
    },
  ],
  [
    {
      label: 'Users',
      icon: 'material-symbols:manage-accounts',
      to: '/admin/users'
    },
  ],
])

onMounted(async () => {
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/admin/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.session.accessToken}`,
        Session: session.session.sessionId
      }
    })

  } catch (e: any) {
    if (e.status === 403) {
      await navigateTo({
        path: "/app"
      })
      window.location.reload()
    }
  }
})

</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar
      resizable
    >
      <template #default>
        <UNavigationMenu
            orientation="vertical"
            :items="items"
            color="neutral"
        />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>

<style scoped>

</style>