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

let avatarUrl = ref(message.value.author.profilePictureUrl)
if (avatarUrl.value === "") avatarUrl.value = "https://images.dog.ceo/breeds/hound-walker/n02089867_2596.jpg"

</script>

<template>
  <MessageContextMenuComponent :message="message">
    <div class="flex gap-4 hover:bg-[var(--ui-bg-muted)] py-0.5 px-4" :class="{ 'mt-4': !grouped }">
      <div class="w-10">
        <ProfilePopover :user="message.author">
          <UAvatar v-if="!grouped" :src="avatarUrl + '?size=40'" size="xl" />
        </ProfilePopover>
      </div>
      <div class="w-5/6">
        <div v-if="!grouped" class="flex items-end gap-2">
          <ProfilePopover :user="message.author">
            <p class="font-bold hover:underline">{{ message.author.username }}</p>
          </ProfilePopover>
          <p class="text-dimmed text-sm" >{{ new Date(message.createdAt).toLocaleTimeString().substring(0, 5) }}</p>
        </div>
        <div v-html="md.render(message.body)" class="break-words break-all w-full markdown-body" />
        <MessageAttachmentsComponent :attachments="message.attachments" />
      </div>
    </div>
  </MessageContextMenuComponent>
</template>

<style scoped>

</style>