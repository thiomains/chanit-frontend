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
        <UButton
            v-if="!revealed && canAccess"
            variant="subtle"
            size="xs"
            :loading="loading"
            @click="showModal = true"
        >
            Reveal
        </UButton>
        <slot v-else-if="revealed" :data="data" />

        <AdminConfirmDataAccessModal
            v-model:open="showModal"
            :field-label="label"
            @confirm="onConfirm"
            @cancel="onCancel"
        />
    </div>
</template>
