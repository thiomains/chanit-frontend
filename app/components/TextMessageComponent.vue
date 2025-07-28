<script setup lang="ts">
const props = defineProps(["message"])
const message = props.message

</script>

<template>
  <div class="flex gap-2">
    <UAvatar src="https://images.dog.ceo/breeds/doberman/n02107142_5570.jpg" size="xl" />
    <div>
      <p class="font-bold">{{ message.author.username }}</p>
      <p>{{ message.body }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>