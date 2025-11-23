<script setup lang="ts">
const props = defineProps(["embed"])

const embed = props.embed

</script>

<template>
  <div class="bg-muted w-sm rounded-md overflow-clip my-1 border border-accented">
    <div class="p-3">
      <a :href="embed.url" class="font-bold text-info hover:underline">{{ embed.title }}</a>
      <p>{{ embed.description }}</p>
    </div>
    <img :src="embed.image" alt="" class="max-h-[24rem] max-w-sm object-cover">
  </div>
</template>

<style scoped>

</style>