<script setup lang="ts">
const props = defineProps(["to", "label", "icon", "layer"])
const route = useRoute()

let active: boolean

onMounted(() => {
  active = route.path === props.to;
  console.log(route.path, props.to, active)
})

</script>

<template>
  <NuxtLink :to="props.to" active-class="shadow-m-inverted layer-0" class="rounded-md p-4 flex justify-start gap-2 transition-all shadow-m">
    <UIcon :name="props.icon" size="24"/>
    <p class="font-bold">{{ props.label }}</p>
  </NuxtLink>
</template>

<style scoped>

</style>