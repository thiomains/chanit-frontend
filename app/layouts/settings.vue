<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[][]>([
  [
    {
    label: 'Account Settings',
    icon: 'material-symbols:manage-accounts',
    to: '/settings/account'
  },
    {
      label: 'Profile',
      icon: 'material-symbols:person-book',
      to: '/settings/profile'
    },
  ],
])

const route = useRoute()
let backRoute = ref(route.query.back as string)
backRoute.value = backRoute.value ? backRoute.value : "/channels/me"

</script>

<template>
  <div class="flex gap-8 p-10 h-screen 2xl:w-[96rem] w-full mx-auto">
    <UNavigationMenu orientation="vertical" :items="items" class="data-[orientation=vertical]:w-64" color="neutral" />
    <USeparator orientation="vertical" />
    <div class="flex-1">
      <slot />
    </div>
    <NuxtLink :to="backRoute">
      <UIcon name="material-symbols:cancel-outline" size="32" />
    </NuxtLink>
  </div>

</template>

