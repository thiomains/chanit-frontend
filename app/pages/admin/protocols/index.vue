<script setup lang="ts">
import { h, resolveComponent, ref, computed } from 'vue'

definePageMeta({ layout: 'admin' })

const api = useAdminApi()
const adminPerms = useAdminPermissions()
const toast = useToast()

const protocols = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(20)
const loading = ref(false)

const filterAdmin = ref('')
const filterAction = ref('')
const filterTarget = ref('')

const UButton = resolveComponent('UButton')

const ACTIONS = ['viewEmail', 'viewSessions', 'viewIpAddress', 'viewFriends', 'suspendUser', 'unsuspendUser', 'setPermission']

async function refreshData() {
    loading.value = true
    try {
        const params = new URLSearchParams()
        params.set('page', String(page.value))
        params.set('limit', String(limit.value))
        if (filterAdmin.value) params.set('admin', filterAdmin.value)
        if (filterAction.value) params.set('action', filterAction.value)
        if (filterTarget.value) params.set('target', filterTarget.value)

        const res = await api.get('/admin/protocols?' + params.toString())
        protocols.value = res.items
        total.value = res.total
    } catch (e) {
        toast.add({ title: 'Failed to load protocols', color: 'error' })
    } finally {
        loading.value = false
    }
}

function onPageChange(newPage: number) {
    page.value = newPage
    refreshData()
}

const columns: any[] = [
    {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }: any) => new Date(row.getValue('timestamp')).toLocaleString()
    },
    { accessorKey: 'adminUsername', header: 'Admin' },
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'targetUsername', header: 'Target User' },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'ipAddress', header: 'IP Address' },
]

onMounted(() => { refreshData() })

watch([filterAdmin, filterAction, filterTarget], () => {
    page.value = 1
    refreshData()
})
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="p-2 flex gap-2 flex-wrap">
            <UInput v-model="filterAdmin" placeholder="Filter by admin..." class="w-48" />
            <USelect v-model="filterAction" :items="ACTIONS" placeholder="Filter by action..." class="w-48" />
            <UInput v-model="filterTarget" placeholder="Filter by target..." class="w-48" />
        </div>
        <UTable :data="protocols" :columns="columns" class="flex-1" :loading="loading" />
        <div class="flex justify-center p-2" v-if="total > limit">
            <UPagination
                :model-value="page"
                :total="total"
                :per-page="limit"
                @update:model-value="onPageChange"
            />
        </div>
    </div>
</template>
