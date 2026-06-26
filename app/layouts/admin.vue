<script setup lang="ts">

import type {NavigationMenuItem} from "@nuxt/ui";

const config = useRuntimeConfig()
const sessionState = useState('session')
const session = sessionState.value as any

const adminPerms = useAdminPermissions()

const items = computed<NavigationMenuItem[][]>(() => {
  const nav: NavigationMenuItem[][] = [
    [{ label: 'Back to app', icon: 'material-symbols:arrow-back-ios-new-rounded', to: '/app' }],
    [{ label: 'Users', icon: 'material-symbols:manage-accounts', to: '/admin/users' }],
  ]
  if (adminPerms.has('managePermissions')) {
    nav.push([{ label: 'Permissions', icon: 'material-symbols:admin-panel-settings', to: '/admin/permissions' }])
  }
  if (adminPerms.has('viewProtocols')) {
    nav.push([{ label: 'Protocols', icon: 'material-symbols:history', to: '/admin/protocols' }])
  }
  return nav
})

onMounted(async () => {
  try {
    await adminPerms.refresh()
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