<script setup lang="ts">
let message = ref("")
</script>

<template>
  <div class="p-4">
    <UInput
        class="w-full"
        v-model="message"
        placeholder="Type a message..."
        size="xl"
        :ui="{ leading: 'ps-1' }"
        autofocus
    >
      <template #leading>
        <UButton icon="material-symbols:add-circle-rounded" variant="link" color="neutral" size="xl" />
      </template>
    </UInput>
  </div>
</template>

<style scoped>

</style>