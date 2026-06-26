<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import MarkdownIt from "markdown-it";

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const userId = route.params.id

const api = useAdminApi()
const adminPerms = useAdminPermissions()

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

interface ProtocolEntry {
  timestamp: number;
  adminUsername: string;
  action: string;
  reason: string;
  ipAddress: string;
}

interface User {
  id: string;
  username: string;
  createdAt: number;
  active: boolean;
  faserId: number;
  emailVerified: boolean;
  profile: Profile;
  friendCount: number;
}

let user = ref<User>()
let protocols = ref<ProtocolEntry[]>([])

async function refresh() {
  try {
    user.value = await api.get('/admin/users?userId=' + userId) as User
  } catch (e) {
    console.log(e)
  }

  if (adminPerms.has('viewProtocols')) {
    try {
      protocols.value = await api.get('/admin/protocols/' + userId)
    } catch (e) {
      console.log(e)
    }
  }
}

onMounted(async () => {
  await refresh()
})
</script>

<template>
  <div class="flex gap-1 lg:gap-4 p-1 lg:p-4 flex-wrap">
    <UCard v-if="user" class="flex-1 overflow-y-auto min-w-xs h-full">
      <template #header>
        <div class="flex items-center justify-between">
          <p class="font-bold text-xl">User Information</p>
          <SuspendUserButton :user-id="user.id" :active="user.active" :username="user.username" @updated="refresh" />
        </div>
      </template>
      <template #default>
        <div class="flex">
          <div class="flex-1 flex flex-col gap-1">
            <p><b>Username</b></p>
            <p><b>Created At</b></p>
            <p><b>Active</b></p>
            <p><b>Faser User ID</b></p>
            <p><b>Email Verified</b></p>
            <p><b>Friend Count</b></p>
          </div>
          <div class="flex-1 flex flex-col gap-1">
            <p>{{ user.username }}</p>
            <p>{{ new Date(user.createdAt).toLocaleString() }}</p>
            <p>{{ user.active }}</p>
            <p>{{ user.faserId }}</p>
            <p>{{ user.emailVerified }}</p>
            <p>{{ user.friendCount }}</p>
          </div>
        </div>
        <ProtectedDataField target-user-id="user.id" field="email" label="Email" required-permission="viewEmail" v-slot="{ data: emailData }">
          <p>{{ emailData?.email }}</p>
        </ProtectedDataField>
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
        <ProtectedDataField target-user-id="user.id" field="friends" label="Friends List" required-permission="viewFriends" v-slot="{ data: friendData }">
          <div class="flex flex-col gap-1 lg:gap-4">
            <div v-for="friend in friendData?.friends">
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
        </ProtectedDataField>
      </template>
    </UCard>
    <UCard v-if="user" class="flex-1 overflow-y-auto min-w-xs h-full">
      <template #header>
        <p class="font-bold text-xl">Sessions</p>
      </template>
      <template #default>
        <ProtectedDataField target-user-id="user.id" field="sessions" label="Session Details" required-permission="viewSessions" v-slot="{ data: sessionData }">
          <div v-if="sessionData?.sessions" class="flex flex-col gap-1 lg:gap-4">
            <div v-for="userSession in sessionData.sessions">
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
                    <ProtectedDataField target-user-id="user.id" field="ipAddress" label="IP Address" required-permission="viewIpAddress" v-slot="{ data: ipData }">
                      <p v-for="s in ipData?.sessions" :key="s.sessionId">{{ s.ipAddress }}</p>
                    </ProtectedDataField>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </ProtectedDataField>
      </template>
    </UCard>
    <UCard v-if="user && adminPerms.has('viewProtocols')" class="flex-1 overflow-y-auto min-w-xs h-full">
      <template #header>
        <p class="font-bold text-xl">Protocol Log</p>
      </template>
      <template #default>
        <div class="flex flex-col gap-1 lg:gap-4">
          <div v-for="entry in protocols">
            <UCard variant="subtle">
              <p class="text-muted text-sm">{{ new Date(entry.timestamp).toLocaleString() }}</p>
              <p><b>{{ entry.adminUsername }}</b> — {{ entry.action }}</p>
              <p>{{ entry.reason }}</p>
              <p class="text-muted text-xs">IP: {{ entry.ipAddress }}</p>
            </UCard>
          </div>
          <p v-if="protocols.length === 0" class="text-muted">No protocol entries</p>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>
