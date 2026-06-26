<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as v from 'valibot'
import { reasonSchema } from '~/utils/adminSchemas'

type Schema = v.InferOutput<typeof reasonSchema>

const props = defineProps<{
    fieldLabel: string
}>()

const emit = defineEmits<{
    confirm: [reason: string]
    cancel: []
}>()

const open = defineModel<boolean>('open', { default: false })

const state = reactive({
    reason: ''
})

const toast = useToast()

function onSubmit(event: FormSubmitEvent<Schema>) {
    emit('confirm', event.data.reason)
    state.reason = ''
    open.value = false
}

function onCancel() {
    state.reason = ''
    open.value = false
    emit('cancel')
}
</script>

<template>
    <UModal v-model:open="open" :close="false">
        <template #content>
            <UCard>
                <template #header>
                    <div class="flex items-center gap-2">
                        <UIcon name="material-symbols:lock-open-outline" size="24" class="text-warning" />
                        <h2 class="text-xl font-bold">Access Protected Data</h2>
                    </div>
                    <p class="text-muted mt-1">You are about to view <b>{{ fieldLabel }}</b> for this user.</p>
                </template>
                <template #default>
                    <UForm id="reason-form" :schema="reasonSchema" :state="state" @submit="onSubmit" class="flex flex-col gap-4">
                        <UFormField label="Reason" name="reason" required>
                            <UTextarea v-model="state.reason" placeholder="Enter the reason for accessing this data..." class="w-full" :rows="3" />
                        </UFormField>
                    </UForm>
                </template>
                <template #footer>
                    <div class="justify-end flex gap-2 w-full">
                        <UButton @click="onCancel" label="Cancel" color="neutral" variant="subtle" />
                        <UButton type="submit" form="reason-form" label="Confirm with Reason" :disabled="state.reason.length < 10" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
