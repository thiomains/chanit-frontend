<script setup lang="ts">
const props = defineProps<{
    userId: string
    active: boolean
    username: string
}>()

const emit = defineEmits<{
    updated: []
}>()

const api = useAdminApi()
const perms = useAdminPermissions()
const toast = useToast()

const loading = ref(false)
const showModal = ref(false)

const reasonState = reactive({
    reason: ''
})

const buttonLabel = computed(() => props.active ? 'Suspend' : 'Unsuspend')
const buttonColor = computed(() => props.active ? 'error' as const : 'success' as const)
const endpoint = computed(() => props.active ? '/suspend' : '/unsuspend')

async function onConfirm(reason: string) {
    loading.value = true
    try {
        await api.post(`/admin/users/${props.userId}${endpoint.value}`, {
            reason,
        })
        toast.add({
            title: props.active ? 'User suspended' : 'User unsuspended',
            description: `${props.username} has been ${props.active ? 'suspended' : 'unsuspended'}.`,
            color: 'info',
        })
        reasonState.reason = ''
        showModal.value = false
        emit('updated')
    } catch (e: any) {
        toast.add({
            title: 'Action failed',
            description: e?.data?.error || 'Unknown error',
            color: 'error',
        })
    } finally {
        loading.value = false
    }
}

function onCancel() {
    reasonState.reason = ''
    showModal.value = false
}
</script>

<template>
    <div v-if="perms.has('suspendUser')">
        <UButton
            :label="buttonLabel"
            :color="buttonColor"
            variant="soft"
            size="xs"
            :loading="loading"
            @click="showModal = true"
        />

        <ConfirmDataAccessModal
            v-model:open="showModal"
            :field-label="`${buttonLabel} user ${props.username}`"
            @confirm="onConfirm"
            @cancel="onCancel"
        />
    </div>
</template>
