<script setup lang="ts">
const props = defineProps<{
    label: string
    active: boolean
}>()
</script>

<template>
    <UBadge
        :label="label"
        :color="active ? 'success' : 'neutral'"
        :variant="active ? 'soft' : 'subtle'"
        size="sm"
    />
</template>
