<script setup lang="ts">
import { computed, ref, onMounted, h, resolveComponent } from 'vue'

definePageMeta({
  layout: 'admin'
})

const api = useAdminApi()
const adminPerms = useAdminPermissions()

const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')

const users = ref<any[]>([])
const data = ref<any[]>([])
const globalFilter = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function refreshData() {
  try {
    const res = await api.get('/admin/users')
    users.value = res
    data.value = res
  } catch (e) {
    console.log(e)
  }
}

function onSearchInput() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (!globalFilter.value) {
      data.value = users.value
      return
    }
    const q = globalFilter.value.toLowerCase()
    data.value = users.value.filter((u: any) =>
      u.id?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.profile?.username?.toLowerCase().includes(q) ||
      (adminPerms.has('viewEmail') && u.email?.toLowerCase().includes(q))
    )
  }, 300)
}

const columns = computed(() => [
  {
    accessorKey: 'profile',
    header: 'Profile',
    cell: ({ row }: any) => {
      const u = row.original
      const displayName = u.profile?.username || u.username
      const avatarUrl = u.profile?.profilePictureUrl
      const isInactive = !u.active
      const isUnverified = !u.emailVerified

      return h('div', { class: 'flex items-center gap-3 w-full min-w-0' }, [
        h(UAvatar, { src: avatarUrl ? avatarUrl + '?size=42' : undefined, size: 'md' }),
        h('div', { class: 'flex flex-col min-w-0' }, [
          h('span', { class: 'font-medium truncate' }, displayName),
          h('span', { class: 'text-sm text-muted truncate' }, '@' + u.username),
        ]),
        ...(isInactive
          ? [h(UBadge, { color: 'error', variant: 'subtle', class: 'shrink-0' }, () => 'Inactive')]
          : []),
        ...(isUnverified
          ? [h(UBadge, { color: 'warning', variant: 'subtle', class: 'shrink-0' }, () => 'Unverified')]
          : []),
      ])
    },
    meta: { class: { td: 'w-full' } },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }: any) => new Date(row.getValue('createdAt')).toLocaleString(),
    meta: { class: { th: 'text-right', td: 'text-right text-muted text-sm whitespace-nowrap' } },
  },
])

function onRowSelect(_e: Event, row: any) {
  navigateTo('/admin/users/' + row.original.id)
}

onMounted(() => {
  refreshData()
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="p-2 shrink-0">
      <UInput
        v-model="globalFilter"
        placeholder="Search users..."
        @input="onSearchInput"
      />
    </div>

    <UTable
      :data="data"
      :columns="columns"
      class="flex-1 min-h-0"
      :sticky="'header'"
      :on-select="onRowSelect"
    />
  </div>
</template>
