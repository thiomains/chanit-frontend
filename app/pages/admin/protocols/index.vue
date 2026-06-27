<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const api = useAdminApi()
const toast = useToast()

const protocols = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(50)
const loading = ref(false)

const filterAdmin = ref('')
const filterAction = ref('')
const filterTarget = ref('')
const showFilters = ref(false)

const ACTIONS = [
  'addAdminAccess', 'removeAdminAccess', 'bulkSetPermissions', 'setPermission',
  'suspendUser', 'unsuspendUser', 'viewEmail', 'viewSessions', 'viewIpAddress', 'viewFriends',
]

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

function resetFilters() {
  filterAdmin.value = ''
  filterAction.value = ''
  filterTarget.value = ''
}

const columns: any[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }: any) => new Date(row.getValue('timestamp')).toLocaleString(),
    meta: { class: { td: 'whitespace-nowrap' } },
  },
  { accessorKey: 'adminUsername', header: 'Admin', meta: { class: { td: 'whitespace-nowrap' } } },
  { accessorKey: 'action', header: 'Action', meta: { class: { td: 'whitespace-nowrap' } } },
  { accessorKey: 'targetUsername', header: 'Target User', meta: { class: { td: 'whitespace-nowrap' } } },
  { accessorKey: 'reason', header: 'Reason', meta: { class: { td: 'max-w-32 break-words whitespace-normal' } } },
  { accessorKey: 'ipAddress', header: 'IP Address', meta: { class: { td: 'whitespace-nowrap' } } },
]

onMounted(() => { refreshData() })

watch([filterAdmin, filterAction, filterTarget], () => {
  page.value = 1
  refreshData()
})

watch(page, () => {
  refreshData()
})
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Sticky filter bar (outside scroll) -->
    <div class="shrink-0 bg-default border-b border-default px-4 lg:px-6 pt-4 lg:pt-6 pb-3">
      <div class="flex items-center justify-between lg:hidden mb-2">
        <span class="text-sm font-medium">Filters</span>
        <UButton
          variant="ghost"
          size="xs"
          :icon="showFilters ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
          @click="showFilters = !showFilters"
        />
      </div>
      <div
        class="flex gap-2 flex-wrap items-center"
        :class="showFilters ? 'flex' : 'hidden lg:flex'"
      >
        <UInput v-model="filterAdmin" placeholder="Filter by admin..." class="w-40" />
        <USelect
          v-model="filterAction"
          :items="ACTIONS"
          placeholder="Filter by action..."
          class="w-44"
        />
        <UInput v-model="filterTarget" placeholder="Filter by target..." class="w-40" />
        <UButton
          variant="ghost"
          size="xs"
          icon="material-symbols:close"
          label="Reset"
          @click="resetFilters"
        />
      </div>
    </div>

    <!-- Scrollable content: table + pagination -->
    <div class="flex-1 min-h-0 min-w-0 flex flex-col">
      <div class="flex-1 min-h-0 min-w-0 overflow-auto px-4 lg:px-6">
        <UTable
          :data="protocols"
          :columns="columns"
          :loading="loading"
          class="min-w-max"
          :ui="{
            td: 'py-2',
            th: 'py-2',
            tr: 'even:bg-[var(--ui-bg-elevated)]/40',
          }"
        />
      </div>

      <div
        v-if="total > limit"
        class="shrink-0 border-t border-default flex justify-center py-3 px-4 lg:px-6"
      >
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="limit"
          :sibling-count="0"
        />
      </div>
    </div>
  </div>
</template>
