<script setup lang="ts">
import prettyBytes from 'pretty-bytes';
const props = defineProps(["attachments"])

interface Attachment {
  url: string,
  mimetype: string,
  attachmentId: string,
  fileName: string,
  fileSize: number,
}

const attachments = props.attachments as Attachment[]

let imageAttachments = ref<String[]>([])
let otherAttachments = ref<Attachment[]>([])

for (let i = 0; i < attachments.length; i++) {
  let attachment = attachments[i] as Attachment
  if (attachment.url === "") continue
  if (attachment.mimetype.startsWith("image")) {
    imageAttachments.value.push(attachment.url)
    continue
  }
  otherAttachments.value.push(attachment)
}

let modalOpen = ref(false)

function showModal(url: any) {
  modalImageUrl.value = url
  modalOpen.value = true
}

function closeModal(event: any) {
  if (event.target !== event.currentTarget) return
  modalOpen.value = false
}

let modalImageUrl = ref("")

function downloadAttachment(attachment: Attachment) {
  window.location.href = attachment.url + '?type=download'
}

</script>

<template>
  <div class="flex flex-wrap max-w-xl overflow-clip gap-1" v-if="imageAttachments.length > 0">
    <NuxtImg @click="showModal(image)" v-for="image in imageAttachments" :src="image as string + (imageAttachments.length > 1 ? '?max=140h' : '?max=280h')" alt="" :class="{ 'h-40': imageAttachments.length > 1 }" class="shrink object-contain"/>
  </div>
  <UModal
      class="bg-transparent"
      v-model:open="modalOpen"
      fullscreen
  >
    <template #content>
      <div @click="closeModal" class="h-screen w-screen flex justify-center items-center">
        <img :src="modalImageUrl" class="max-w-5/6 max-h-5/6" :alt="modalImageUrl">
      </div>
    </template>
  </UModal>
  <div v-if="otherAttachments.length > 0">
    <div v-for="attachment of otherAttachments" class="mb-2 p-4 border border-muted bg-default rounded-lg items-center flex gap-2 max-w-fit">
      <UIcon name="material-symbols:unknown-document" class="size-8" />
      <div class="flex flex-col gap-1 w-48">
        <p class="leading-none truncate">{{ attachment.fileName }}</p>
        <p class="text-muted leading-none truncate">{{ prettyBytes(attachment.fileSize) }}</p>
      </div>
      <UButton @click="downloadAttachment(attachment)" icon="material-symbols:download" variant="link" color="neutral" size="xl" />
    </div>
  </div>
</template>

<style scoped>

</style>