<script setup lang="ts">

import type {NavigationMenuItem} from "@nuxt/ui";

const config = useRuntimeConfig()
const sessionState = useState('session')
const session = sessionState.value as any

const route = useRoute()
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

const bottomItems = computed(() => {
  return items.value.flat()
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
    <UDashboardSidebar resizable class="hidden lg:flex">
      <template #default>
        <UNavigationMenu
            orientation="vertical"
            :items="items"
            color="neutral"
        />
      </template>
    </UDashboardSidebar>

    <div class="flex-1 min-h-0 min-w-0 pb-14 lg:pb-0">
      <slot />
    </div>
  </UDashboardGroup>

  <nav class="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-default border-t border-default z-50 flex items-center justify-around">
    <NuxtLink
      v-for="(item, index) in bottomItems"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-0.5 py-1 min-w-0 flex-1"
      :class="[index === 0 ? 'max-w-12' : '', route.path.startsWith(item.to as string) ? 'text-primary' : 'text-muted']"
    >
      <UIcon :name="item.icon as string" size="22" />
      <span v-if="index !== 0" class="text-[10px] leading-tight truncate">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>

</style>
