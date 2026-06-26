<script setup lang="ts">
import { h, resolveComponent, computed } from 'vue'

definePageMeta({ layout: 'admin' })

const api = useAdminApi()
const adminPerms = useAdminPermissions()
const toast = useToast()

const admins = ref<any[]>([])
const loading = ref(false)

const PERMISSION_KEYS = [
    'adminAccess', 'viewUserInformation', 'viewEmail', 'viewIpAddress',
    'viewSessions', 'viewFriends', 'suspendUser', 'managePermissions', 'viewProtocols'
]

const UCheckbox = resolveComponent('UCheckbox')

async function refreshData() {
    loading.value = true
    try {
        const res = await api.get('/admin/permissions')
        admins.value = res
    } catch (e) {
        toast.add({ title: 'Failed to load permissions', color: 'error' })
    } finally {
        loading.value = false
    }
}

async function togglePermission(userId: string, perm: string, current: boolean) {
    try {
        await api.post(`/admin/permissions/${userId}`, { permission: perm, value: !current })
        toast.add({ title: 'Permission updated', color: 'success' })
        await refreshData()
    } catch (e: any) {
        toast.add({ title: 'Failed to update permission', description: e?.data?.error || 'Unknown error', color: 'error' })
    }
}

const columns = computed(() => {
    const cols: any[] = [
        {
            accessorKey: 'profilePictureUrl',
            header: '',
            cell: ({ row }: any) => {
                const url = row.original.profilePictureUrl
                return h('div', { innerHTML: `<img class='h-[42px]' src='${url}?size=42'>` })
            }
        },
        { accessorKey: 'username', header: 'Admin' },
    ]

    for (const perm of PERMISSION_KEYS) {
        cols.push({
            id: perm,
            header: perm.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()),
            cell: ({ row }: any) => {
                const original = row.original
                const hasPerm = original.permissions?.[perm] === true
                return h(UCheckbox, {
                    modelValue: hasPerm,
                    disabled: perm === 'managePermissions' && !adminPerms.has('managePermissions'),
                    'onUpdate:modelValue': () => togglePermission(original.userId, perm, hasPerm),
                })
            },
            meta: { class: { td: 'text-center' } }
        })
    }

    return cols
})

onMounted(() => { refreshData() })
</script>

<template>
    <div>
        <UTable :data="admins" :columns="columns" class="flex-1" :loading="loading" />
    </div>
</template>
