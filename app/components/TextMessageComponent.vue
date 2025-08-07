<script setup>
import MessageAttachmentsComponent from "~/components/MessageAttachmentsComponent.vue";

const props = defineProps(["message", "grouped"])
const message = ref(props.message)
const grouped = ref(props.grouped)

import MarkdownIt from "markdown-it"

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
}).disable(['hr', 'image'])

</script>

<template>
  <div class="flex gap-4 hover:bg-[var(--ui-bg-muted)] py-0.5 px-4" :class="{ 'mt-4': !grouped }">
    <div class="w-10">
      <UAvatar v-if="!grouped" src="https://images.dog.ceo/breeds/doberman/n02107142_5570.jpg" size="xl" />
    </div>
    <div class="w-5/6">
      <div v-if="!grouped" class="flex items-end gap-2">
        <p class="font-bold">{{ message.author.username }}</p>
        <p class="text-dimmed text-sm" >{{ new Date(message.createdAt).toLocaleTimeString().substring(0, 5) }}</p>
      </div>
      <div v-html="md.render(message.body)" class="break-words break-all w-full markdown-body" />
      <MessageAttachmentsComponent :attachments="message.attachments" />
    </div>
  </div>
</template>

<style scoped>

</style>