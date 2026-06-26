<script setup lang="ts">
const props = defineProps<{
    targetUserId: string
    field: 'email' | 'sessions' | 'ipAddress' | 'friends'
    label: string
    requiredPermission: string
}>()

const perms = useAdminPermissions()
const api = useAdminApi()
const toast = useToast()

const revealed = ref(false)
const data = ref<any>(null)
const loading = ref(false)
const showModal = ref(false)

const canAccess = computed(() => perms.has(props.requiredPermission))

async function onConfirm(reason: string) {
    loading.value = true
    try {
        const result = await api.post(`/admin/users/${props.targetUserId}/protected-data`, {
            field: props.field,
            reason,
        })
        data.value = result
        revealed.value = true
        toast.add({ title: 'Data revealed', description: `Access to ${props.label} has been logged.`, color: 'info' })
    } catch (e: any) {
        toast.add({ title: 'Failed to access data', description: e?.data?.error || 'Unknown error', color: 'error' })
    } finally {
        loading.value = false
        showModal.value = false
    }
}

function onCancel() {
    showModal.value = false
}
</script>

<template>
    <div>
        <div v-if="!revealed && canAccess" class="flex items-center gap-2 py-2">
            <UIcon name="material-symbols:lock-outline" size="20" class="text-muted" />
            <span class="text-muted italic">{{ label }} is protected</span>
            <UButton variant="subtle" size="xs" :loading="loading" @click="showModal = true">
                Reveal
            </UButton>
        </div>
        <div v-else-if="!revealed && !canAccess" class="flex items-center gap-2 py-2">
            <UIcon name="material-symbols:lock-outline" size="20" class="text-muted" />
            <span class="text-muted italic">No permission to view {{ label }}</span>
        </div>
        <div v-else>
            <slot :data="data" />
        </div>

        <ConfirmDataAccessModal
            v-model:open="showModal"
            :field-label="label"
            @confirm="onConfirm"
            @cancel="onCancel"
        />
    </div>
</template>
