<script setup lang="ts">
const sessionState = useState("session")
const config = useRuntimeConfig()
const session = ref(sessionState.value as {
  user: {
    username: string,
    loginName: string
    profilePictureUrl: string,
    bio: string,
  },
  session: {
    accessToken: string,
    sessionId: string,
  },
})

function bio() {
  let userBio = session.value.user.bio
  if (userBio === "") return "No bio yet"
  return userBio
}

let newUsername = ref(session.value.user.username)
let newBio = ref(session.value.user.bio)
let profilePicture = ref<File>()
let newImg = ref<File>()
let imgSrc = ref(session.value.user.profilePictureUrl + "?size=300")

function resetProfileUpdate() {
  newUsername.value = session.value.user.username
  newBio.value = session.value.user.bio
  imgSrc.value = session.value.user.profilePictureUrl + "?size=300"
  newImg.value = undefined
}

async function changePicture() {
  if (!profilePicture) return
  const imgFile = profilePicture.value as File
  if (!imgFile.type.startsWith("image")) return
  imgSrc.value = await fileToBase64(imgFile) as string
  newImg.value = profilePicture.value
  profilePicture.value = undefined
}

function fileToBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function updateProfile() {

  try {
    const res = await $fetch(config.public.apiBaseUrl + "/settings/profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      },
      body: {
        username: newUsername.value,
        bio: newBio.value,
      }
    })

    if (!newImg) return
    const formData = new FormData()
    const imgFile = newImg.value as File
    formData.append('avatar', imgFile)
    const imgRes = await $fetch(config.public.apiBaseUrl + "/settings/profile/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      },
      body: formData,
    })
  } catch (e) {
    console.log(e)
  }
}

</script>

<template>
  <UCard>
    <div class="flex items-center gap-4 mb-4">
      <NuxtImg class="h-18 rounded-full" :src="session.user.profilePictureUrl + '?size=72'" />
      <div>
        <p class="font-bold">{{ session.user.username }}</p>
        <UTooltip text="Login name. Cannot be changed. Is not publicly visible">
          <p class="text-dimmed">{{ session.user.loginName }}</p>
        </UTooltip>
      </div>
      <UModal
          title="Edit Profile"
      >
        <UButton class="ml-auto" leading-icon="material-symbols:edit" variant="subtle" label="Edit Profile" />

        <template #body>
          <div class="flex gap-4 mb-4">
            <NuxtImg class="h-36 w-36 object-cover rounded-full" :src="imgSrc" />
            <UFileUpload v-model="profilePicture" @update:modelValue="changePicture" label="Upload a Profile Picture" class="flex-1" description="PNG or JPG files" accept="image/*" />
          </div>
          <div class="mb-4">
            <p class="text-sm text-muted">Username</p>
            <UInput v-model="newUsername" class="w-full" size="xl" />
          </div>
          <div class="mb-4">
            <p class="text-sm text-muted">Bio</p>
            <UTextarea v-model="newBio" autoresize class="w-full" size="xl" />
          </div>
          <UButton @click="updateProfile" class="mb-2" block label="Update Profile" />
          <br>
          <UButton @click="resetProfileUpdate" block variant="link" label="Revert changes" />
        </template>
      </UModal>
    </div>
    <p class="text-muted" :class="{ 'italic': session.user.bio === '' }">{{ bio() }}</p>
  </UCard>
</template>

<style scoped>

</style>