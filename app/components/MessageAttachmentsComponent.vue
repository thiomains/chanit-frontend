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
  <UCarousel
      v-if="imageAttachments.length > 0"
      v-slot="{ item }"
      :items="imageAttachments"
      class="w-xs items-center justify-center border border-accented rounded-lg mb-10 bg-default"
      arrows
      dots
  >
    <div @click="showModal(item)" class="flex h-[20rem] w-xs justify-center items-center">
      <img :src="item + '?max=100h'" alt="Image Attachment" class="max-h-full max-w-full">
    </div>
  </UCarousel>
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