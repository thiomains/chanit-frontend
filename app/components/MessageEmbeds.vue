<script setup lang="ts">
const props = defineProps(["embeds"])

const embeds = props.embeds

</script>

<template>
  <MessageEmbed v-for="embed of embeds" :embed="embed"/>
</template>

<style scoped>

</style>