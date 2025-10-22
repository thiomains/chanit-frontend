<script setup>
definePageMeta({
  layout: 'admin'
})

const config = useRuntimeConfig()
const sessionState = useState('session')
const session = sessionState.value
const UIcon = resolveComponent('UIcon')
const UButton = resolveComponent('UButton')

let users = ref()
let data = ref([])

onMounted(async () => {
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/admin/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.session.accessToken}`,
        Session: session.session.sessionId
      }
    })

    users.value = res

    data.value = users.value

  } catch (e) {
    console.log(e)
  }
})

const columns = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'profile.profilePictureUrl',
    header: 'Profile Picture',
    cell: ({row}) => {
      const original = row.original
      const imgUrl = original?.profile.profilePictureUrl
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
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'emailVerified',
    header: 'Email Verified',
    cell: ({row}) => {
      const original = row.original
      const emailVerified = original.emailVerified
      const iconName = emailVerified ? 'material-symbols:check' : 'material-symbols:close'
      const color = emailVerified ? 'text-neutral' : 'text-error'
      return h(UIcon, { name: iconName, size: '24', class: color })
    }
  },
  {
    accessorKey: 'active',
    header: 'Active',
    cell: ({row}) => {
      const original = row.original
      const active = original.active
      const iconName = active ? 'material-symbols:check' : 'material-symbols:close'
      const color = active ? 'text-neutral' : 'text-error'
      return h(UIcon, { name: iconName, size: '24', class: color })
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Account Creation Date',
    cell: ({row}) => {
      return new Date(row.getValue('createdAt')).toLocaleString()
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const original = row.original
      const path = '/admin/users/' + original.id
      return h('div', { class: 'text-right' },
          h(UButton, { variant: 'subtle', label: 'View User', to: path })
      )
    },
  }
]

const globalFilter = ref("")

</script>

<template>
  <div>
    <div class="p-2 flex gap-1">
      <UInput v-model="globalFilter" placeholder="Search.."/>
    </div>
    <UTable
        :data="data"
        class="flex-1"
        :columns="columns"
        v-model:global-filter="globalFilter"

    />
  </div>
</template>

<style scoped>

</style>