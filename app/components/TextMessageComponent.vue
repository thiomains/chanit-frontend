<script setup>
import MessageAttachmentsComponent from "~/components/MessageAttachmentsComponent.vue";

const props = defineProps(["message", "grouped", "inThreadView"])
const emit = defineEmits(["thread-click", "reply-click"])
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

const replyIndicatorText = computed(() => {
  if (message.value.replyToUsername) {
    return "replied to @" + message.value.replyToUsername
  }
  return "replied to a message"
})
</script>

<template>
  <div class="group">
    <MessageContextMenuComponent :message="message" @reply="$emit('reply-click', $event)">
      <div class="hover:bg-[var(--ui-bg-muted)] py-0.5 px-4" :class="{ 'mt-4': !grouped }">
        <div
          v-if="message.replyTo && !props.inThreadView"
          class="flex items-center gap-1 cursor-pointer hover:underline text-dimmed mb-0.5 pl-14"
          @click="$emit('thread-click', message.replyTo)"
        >
          <UIcon name="material-symbols:reply" class="size-3.5" />
          <span class="text-xs">{{ replyIndicatorText }}</span>
        </div>
        <div class="flex gap-4">
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
            <div v-html="md.render(message.body)" class="break-words break-all w-full markdown-body" /><p v-if="message.lastEdited" class="text-dimmed text-sm">(edited)</p>
            <MessageAttachmentsComponent :attachments="message.attachments" />
            <MessageEmbeds :embeds="message.embeds"/>
          </div>
          <div v-if="!props.inThreadView" class="flex items-start pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            <UButton
              icon="material-symbols:reply"
              variant="ghost"
              color="neutral"
              size="xs"
              @click="$emit('reply-click', message)"
            />
          </div>
        </div>
      </div>
    </MessageContextMenuComponent>
  </div>
</template>

<style scoped>

</style>
