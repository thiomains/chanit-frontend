<script setup>
import MessageAttachmentsComponent from "~/components/MessageAttachmentsComponent.vue";

const props = defineProps(["message", "grouped", "inThreadView", "highlighted"])
const emit = defineEmits(["thread-click", "reply-click", "mention-user"])
const message = computed(() => props.message)
const grouped = computed(() => props.grouped)

import MarkdownIt from "markdown-it"

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
}).disable(['hr', 'image'])

let avatarUrl = ref(message.value.author.profilePictureUrl)
if (avatarUrl.value === "") avatarUrl.value = "https://images.dog.ceo/breeds/hound-walker/n02089867_2596.jpg"

const replyIndicatorText = computed(() => {
  const msg = props.message
  const base = msg.replyToUsername
    ? "replied to @" + msg.replyToUsername
    : "replied to a message"
  if (msg.replyToBody) {
    const body = msg.replyToBody.replace(/\n/g, ' ')
    const preview = body.length > 30 ? body.substring(0, 30) + "…" : body
    return base + ": " + preview
  }
  return base
})
</script>

<template>
  <div class="group">
    <MessageContextMenuComponent :message="message" @reply="$emit('reply-click', $event)" @mention-user="(username) => $emit('mention-user', username)">
      <div
        :id="'msg-' + message.messageId"
        class="hover:bg-[var(--ui-bg-muted)] py-0.5 px-4 transition-colors"
        :class="{ 'mt-4': !grouped, 'bg-[var(--ui-bg-accented)]': props.highlighted }"
      >
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
