<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

definePageMeta({
  layout: 'admin'
})

const api = useAdminApi()
const adminPerms = useAdminPermissions()

const SuspendUserButton = resolveComponent('SuspendUserButton')
const UIcon = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')

const users = ref<any[]>([])
const data = ref<any[]>([])

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

const columns = computed(() => {
  const cols: any[] = [
    {
      accessorKey: 'id',
      header: 'ID'
    },
    {
      accessorKey: 'profile.profilePictureUrl',
      header: '',
      cell: ({ row }: any) => {
        const imgUrl = row.original?.profile?.profilePictureUrl
        return h('div', { innerHTML: '<img class=\'h-[42px]\' src=\'' + imgUrl + '?size=42\'>' })
      }
    },
    {
      accessorKey: 'profile.username',
      header: 'Profile Name'
    },
    {
      accessorKey: 'username',
      header: 'Login Name'
    },
  ]

  if (adminPerms.has('viewEmail')) {
    cols.push({
      accessorKey: 'email',
      header: 'Email'
    })
  }

  cols.push(
    {
      accessorKey: 'emailVerified',
      header: 'Verified',
      cell: ({ row }: any) => {
        const v = row.original.emailVerified
        return h(UIcon, { name: v ? 'material-symbols:check' : 'material-symbols:close', size: '24', class: v ? 'text-neutral' : 'text-error' })
      }
    },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }: any) => {
        const a = row.original.active
        return h(UIcon, { name: a ? 'material-symbols:check' : 'material-symbols:close', size: '24', class: a ? 'text-neutral' : 'text-error' })
      }
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => new Date(row.getValue('createdAt')).toLocaleString()
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        const original = row.original
        const path = '/admin/users/' + original.id
        return h('div', { class: 'flex items-center gap-1 justify-end' },
          h(SuspendUserButton, {
            userId: original.id,
            active: original.active,
            username: original.profile?.username || original.username,
            onUpdated: () => refreshData(),
          }),
          h(UButton, { variant: 'subtle', label: 'View', to: path, size: 'xs' })
        )
      },
    }
  )

  return cols
})

const globalFilter = ref('')

onMounted(() => { refreshData() })
</script>

<template>
  <div>
    <div class="p-2 flex gap-1">
      <UInput v-model="globalFilter" placeholder="Search users..." @input="onSearchInput" />
    </div>
    <UTable
        :data="data"
        class="flex-1"
        :columns="columns"
        v-model:global-filter="globalFilter"
    />
  </div>
</template>
