<script setup lang="ts">
import MarkdownIt from "markdown-it";

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const userId = route.params.id
const config = useRuntimeConfig()
const sessionState = useState('session')
const session = sessionState.value as any

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
}).disable(['hr', 'image'])

interface Profile {
  userId: string;
  username: string;
  profilePictureUrl: string;
  bio: string;
  createdAt: number;
}

interface FriendUser {
  userId: string;
  username: string;
  profilePictureUrl: string;
  bio: string;
  createdAt: number;
}

interface Friend {
  friendsSince: number;
  directChannelId: string;
  user: FriendUser;
}

interface Session {
  sessionId: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
  lastUsed: number;
  active: boolean;
  deviceIdentifier: string;
  ipAddress: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: number;
  active: boolean;
  faserId: number;
  emailVerified: boolean;
  profile: Profile;
  friends: Friend[];
  sessions: Session[];
}

let user = ref<User>()

onMounted(async () => {
  try {
    const res = await $fetch(config.public.apiBaseUrl + "/admin/users?userId=" + userId, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.session.accessToken}`,
        Session: session.session.sessionId
      }
    })

    user.value = res as User
    console.log(user.value)
  } catch (e) {
    console.log(e)
  }
})

</script>

<template>
  <div class="flex gap-1 lg:gap-4 p-1 lg:p-4 flex-wrap">
    <UCard v-if="user" class="flex-1 overflow-y-auto min-w-xs h-full">
      <template #header>
        <p class="font-bold text-xl">User Information</p>
      </template>
      <template #default>
        <div class="flex">
          <div class="flex-1 flex flex-col gap-1">
            <p><b>Username</b></p>
            <p><b>Email</b></p>
            <p><b>Created At</b></p>
            <p><b>Active</b></p>
            <p><b>Faser User ID</b></p>
            <p><b>Email Verified</b></p>
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <p>{{ user.username }}</p>
            <p>{{ user.email }}</p>
            <p>{{ new Date(user.createdAt).toLocaleString() }}</p>
            <p>{{ user.active }}</p>
            <p>{{ user.faserId }}</p>
            <p>{{ user.emailVerified }}</p>
          </div>
        </div>
      </template>
    </UCard>
    <UCard v-if="user" class="flex-1 overflow-y-auto min-w-xs h-full">
      <template #header>
        <p class="font-bold text-xl">User Profile</p>
      </template>
      <template #default>
        <div class="flex items-center gap-2 pb-2">
          <UAvatar :src="user.profile.profilePictureUrl" size="xl"/>
          <div>
            <p class="font-bold">{{ user.profile.username }}</p>
          </div>
        </div>
        <div v-html="md.render(user.profile.bio)" class="w-full markdown-body" />
      </template>
    </UCard>
    <UCard v-if="user" class="flex-1 overflow-y-auto min-w-xs h-full">
      <template #header>
        <p class="font-bold text-xl">Friends</p>
      </template>
      <template #default>
        <div class="flex flex-col gap-1 lg: gap-4">
          <div v-for="friend of user.friends">
            <NuxtLink :to="'/admin/users/' + friend.user.userId">
              <UCard variant="subtle">
                <div class="flex gap-2 items-center">
                  <UAvatar :src="friend.user.profilePictureUrl" size="2xl"/>
                  <p class="font-bold">{{ friend.user.username }}</p>
                  <div class="ml-auto">
                    <p>Friends Since</p>
                    <p class="text-muted">{{ new Date(friend.friendsSince).toLocaleString() }}</p>
                  </div>
                </div>
              </UCard>
            </NuxtLink>
          </div>
        </div>
      </template>
    </UCard>
    <UCard v-if="user" class="flex-1 overflow-y-auto min-w-xs h-full">
      <template #header>
        <p class="font-bold text-xl">Sessions</p>
      </template>
      <template #default>
        <div class="flex flex-col gap-1 lg: gap-4">
          <div v-for="userSession in user.sessions">
            <UCard variant="subtle">
              <p class="font-bold">{{ userSession.deviceIdentifier }}</p>
              <div class="flex mt-4">
                <div class="flex-1 flex flex-col gap-1">
                  <p><b>Created At</b></p>
                  <p><b>Last Used</b></p>
                  <p><b>Expires At</b></p>
                  <p><b>Active</b></p>
                  <p><b>IP Address</b></p>
                </div>
                <div class="flex-1 flex flex-col gap-1">
                  <p>{{ new Date(userSession.createdAt).toLocaleString() }}</p>
                  <p>{{ new Date(userSession.lastUsed).toLocaleString() }}</p>
                  <p>{{ new Date(userSession.expiresAt).toLocaleString() }}</p>
                  <p>{{ userSession.active }}</p>
                  <p>{{ userSession.ipAddress }}</p>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>