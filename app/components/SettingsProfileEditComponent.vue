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
let imgSrc = ref(session.value.user.profilePictureUrl)

function resetProfileUpdate() {
  newUsername.value = session.value.user.username
  newBio.value = session.value.user.bio
  imgSrc.value = session.value.user.profilePictureUrl
  newImg.value = undefined
}

async function changePicture() {
  if (!profilePicture) return
  const imgFile = profilePicture.value as File
  if (!imgFile.type.startsWith("image")) return

  imgSrc.value = URL.createObjectURL(imgFile)
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

let updateButtonDisabled = ref(false)
let removePictureButtonDisabled = ref(false)

const { $refreshUser } = useNuxtApp()

async function updateProfile(close: any) {

  updateButtonDisabled.value = true

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

    if (newImg.value) {
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
    }

    await $refreshUser()

    resetProfileUpdate()

    close()

    updateButtonDisabled.value = false

  } catch (e) {
    console.log(e)
  }
}

async function removeAvatar(close: any) {

  removePictureButtonDisabled.value = true

  try {
    const res = await $fetch(config.public.apiBaseUrl + "/settings/profile/avatar", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      },
    })

    await $refreshUser()

    resetProfileUpdate()

    close()

    removePictureButtonDisabled.value = false

  } catch (e) {
    console.log(e)
  }
}

function avatarUrl() {
  let suffix = ""
  if (!imgSrc.value.startsWith("blob")) suffix = "?size=300"
  return imgSrc.value === "" ? "https://cdn.minescope.eu/attachments/76509151861145600/78839340859392000/78839341262045184/Download%20(17).png?size=300" : imgSrc.value + suffix
}

</script>

<template>
  <UCard>
    <div class="flex items-center gap-4 mb-4">
      <NuxtImg class="h-18 rounded-full" :src="avatarUrl()" />
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

        <template #body="{ close }">
          <div class="flex gap-4 mb-4">
            <div class="text-center">
              <NuxtImg class="h-36 w-36 object-cover rounded-full" :src="avatarUrl()" />
              <UModal title="Remove Picture" description="Are you sure you want to remove your picture?" :close="false">
                <UTooltip text="If your faser account is linked, your faser avatar will be applied the next time you log in">
                  <UButton variant="link" color="neutral" label="Remove Picture" class="underline" v-if="imgSrc !== ''" />
                </UTooltip>

                <template #body="{ close }">
                  <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="outline" @click="close" />
                    <UButton :loading="removePictureButtonDisabled" label="Remove" color="error" @click="removeAvatar(close)" />
                  </div>
                </template>
              </UModal>
            </div>
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
          <UButton :loading="updateButtonDisabled" @click="updateProfile(close)" class="mb-2" block label="Update Profile" />
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