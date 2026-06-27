<script setup lang="ts">
import { h, resolveComponent } from 'vue'

definePageMeta({ layout: 'admin' })

const api = useAdminApi()
const toast = useToast()

const UAvatar = resolveComponent('UAvatar')
const UButton = resolveComponent('UButton')
const USwitch = resolveComponent('USwitch')

const PERMISSION_KEYS = [
  'viewUserInformation', 'viewEmail', 'viewIpAddress',
  'viewSessions', 'viewFriends', 'suspendUser', 'managePermissions', 'viewProtocols',
]

function permissionLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}

const admins = ref<any[]>([])
const loading = ref(false)

const showAddModal = ref(false)
const addUsername = ref('')
const addLoading = ref(false)
const addError = ref('')

const showEditModal = ref(false)
const editingAdmin = ref<any>(null)
const editPermissions = ref<Record<string, boolean>>({})
const editLoading = ref(false)
const editError = ref('')
const removeLoading = ref(false)

async function refreshData() {
  loading.value = true
  try {
    admins.value = await api.get('/admin/permissions')
  } catch (e: any) {
    toast.add({ title: 'Failed to load permissions', description: e?.data?.error, color: 'error' })
  } finally {
    loading.value = false
  }
}

function openEditModal(admin: any) {
  editingAdmin.value = admin
  editPermissions.value = { ...admin.permissions }
  editError.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editingAdmin.value = null
  editPermissions.value = {}
}

async function savePermissions() {
  editLoading.value = true
  editError.value = ''
  try {
    await api.post(`/admin/permissions/${editingAdmin.value.userId}/bulk`, {
      permissions: editPermissions.value,
    })
    toast.add({ title: 'Permissions saved', color: 'success' })
    closeEditModal()
    await refreshData()
  } catch (e: any) {
    editError.value = e?.data?.error || 'Failed to save permissions'
  } finally {
    editLoading.value = false
  }
}

async function removeAdminAccess() {
  removeLoading.value = true
  editError.value = ''
  try {
    await api.del(`/admin/permissions/${editingAdmin.value.userId}`)
    toast.add({ title: 'Admin access removed', color: 'info' })
    closeEditModal()
    await refreshData()
  } catch (e: any) {
    editError.value = e?.data?.error || 'Failed to remove admin access'
  } finally {
    removeLoading.value = false
  }
}

async function addAdmin() {
  if (!addUsername.value.trim()) return
  addLoading.value = true
  addError.value = ''
  try {
    await api.post('/admin/permissions', { username: addUsername.value.trim() })
    toast.add({ title: 'Admin added', color: 'success' })
    addUsername.value = ''
    showAddModal.value = false
    await refreshData()
  } catch (e: any) {
    addError.value = e?.data?.error || 'Failed to add admin'
  } finally {
    addLoading.value = false
  }
}

function openAddModal() {
  addUsername.value = ''
  addError.value = ''
  showAddModal.value = true
}

const columns = [
  {
    accessorKey: 'profile',
    header: 'Admin',
    cell: ({ row }: any) => {
      const a = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h(UAvatar, { src: a.profilePictureUrl ? a.profilePictureUrl + '?size=42' : undefined, size: 'md' }),
        h('span', { class: 'font-medium truncate' }, a.username),
      ])
    },
    meta: { class: { td: 'w-full' } },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }: any) =>
      h('div', { class: 'flex justify-end' }, [
        h(UButton, {
          variant: 'ghost',
          size: 'xs',
          label: 'Edit',
          onClick: () => openEditModal(row.original),
        }),
      ]),
    meta: { class: { td: 'text-right' } },
  },
] as const

onMounted(() => { refreshData() })
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="p-4 lg:p-6 shrink-0 flex justify-between items-center">
      <h2 class="text-xl font-bold">Admin Permissions</h2>
      <UButton variant="solid" size="sm" icon="material-symbols:add" label="Add Admin" @click="openAddModal" />
    </div>

    <div class="flex-1 min-h-0 overflow-auto px-4 lg:px-6 pb-4 lg:pb-6">
      <UTable
        :data="admins"
        :columns="columns"
        :loading="loading"
        class="flex-1"
        :sticky="'header'"
        :ui="{ td: 'py-2.5', th: 'py-2.5' }"
      />
    </div>
  </div>

  <!-- Add Admin Modal -->
  <UModal v-model:open="showAddModal" title="Add Admin">
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Username">
          <UInput
            v-model="addUsername"
            placeholder="Enter username..."
            @keyup.enter="addAdmin"
          />
        </UFormField>
        <p v-if="addError" class="text-sm text-error">{{ addError }}</p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" label="Cancel" @click="showAddModal = false" />
        <UButton variant="solid" label="Add" :loading="addLoading" @click="addAdmin" />
      </div>
    </template>
  </UModal>

  <!-- Edit Permissions Modal -->
  <UModal v-model:open="showEditModal" :title="'Edit Permissions — @' + (editingAdmin?.username ?? '')">
    <template #body>
      <div class="flex flex-col gap-4">
        <div
          v-for="key in PERMISSION_KEYS"
          :key="key"
          class="flex items-center justify-between py-2 border-b border-default last:border-0"
        >
          <span class="text-sm">{{ permissionLabel(key) }}</span>
          <USwitch
            :model-value="editPermissions[key] === true"
            @update:model-value="(v: boolean) => editPermissions[key] = v"
          />
        </div>
        <p v-if="editError" class="text-sm text-error">{{ editError }}</p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-between w-full">
        <UButton
          variant="outline"
          color="error"
          label="Remove Admin Access"
          :loading="removeLoading"
          @click="removeAdminAccess"
        />
        <div class="flex gap-2">
          <UButton variant="outline" label="Cancel" @click="closeEditModal" />
          <UButton variant="solid" label="Save" :loading="editLoading" @click="savePermissions" />
        </div>
      </div>
    </template>
  </UModal>
</template>
