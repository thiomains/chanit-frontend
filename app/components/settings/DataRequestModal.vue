<script setup lang="ts">

function close() {
  open.value = false
}

let open = ref(false)

const config = useRuntimeConfig()
const sessionState = useState('session')
const session = sessionState.value as any
const toast = useToast()

async function dataRequest() {
  loading.value = true

  try {
    const res = await $fetch(config.public.apiBaseUrl + "/settings/data", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.session.accessToken}`,
        Session: session.session.sessionId
      },
      responseType: "blob"
    }) as any

    const url = URL.createObjectURL(res);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_data.zip";
    a.click();
    URL.revokeObjectURL(url);

    loading.value = false

  } catch (e: any) {
    console.log(e)
    toast.add({ title: 'Could not submit data request', color: 'error' })
    loading.value = false
    return
  }

  close()
  openSuccessModal()

}

let loading = ref(false)

function openSuccessModal() {
  successOpen.value = true
}

function closeSuccessModal() {
  successOpen.value = false
}

let successOpen = ref(false)

</script>

<template>
  <UModal v-model:open="open">
    <slot/>
    <template #content>
      <UCard>
        <template #header>
          <h2 class="text-xl font-bold">Request Your Data</h2>
        </template>
        <template #default>
          <p>Your data is ready to be exported. You can download it directly below.</p>
        </template>
        <template #footer>
          <div class="justify-end flex gap-2 w-full">
            <UButton @click="close" label="Cancel" color="neutral" variant="subtle"/>
            <UButton @click="dataRequest" :loading="loading" label="Download"/>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
  <UModal :open="successOpen">
    <template #content>
      <UCard>
        <p>Your data has been downloaded successfully.</p>
        <template #footer>
          <UButton @click="closeSuccessModal" label="Okay" block/>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<style scoped>

</style>