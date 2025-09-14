<script setup lang="ts">
import MarkdownIt from "markdown-it";
import { DateTime } from "luxon"

const props = defineProps(["user"])

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
}).disable(['hr', 'image'])
</script>

<template>
<UPopover
    class="cursor-pointer"
    :content="{
      side: 'right',
      align: 'end',

    }"
    arrow
>
  <slot/>

  <template #content>
    <div class="w-xs">
      <UCard variant="subtle">
        <div class="flex gap-4 items-center">
          <NuxtImg :src="props.user.profilePictureUrl + '?max=48'" class=" h-12 w-12 shrink-0 rounded-full"/>
          <h2 class="text-xl font-bold">{{ props.user.username }}</h2>
        </div>
        <USeparator class="m-4" />
        <div v-html="md.render(props.user.bio)" class="w-full markdown-body" />
        <p class="text-dimmed text-sm mt-4">Using Chanit since {{ DateTime.fromJSDate(new Date(props.user.createdAt)).toLocaleString()  }}</p>
      </UCard>
    </div>
  </template>
</UPopover>
</template>

<style scoped>

</style>