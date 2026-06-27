<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import MarkdownIt from "markdown-it";

const AdminProtectedDataField = resolveComponent('AdminProtectedDataField')

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
const showFriendsModal = ref(false)

async function refresh() {
  try {
    user.value = await api.get('/admin/users?userId=' + userId) as User
  } catch (e) {
    console.log(e)
  }

  if (adminPerms.has('viewProtocols')) {
    try {
      const res = await api.get('/admin/protocols/' + userId)
      protocols.value = res.items
    } catch (e) {
      console.log(e)
    }
  }
}

const userInfoColumns = [
  { accessorKey: 'label', header: 'Field', meta: { class: { td: 'font-medium whitespace-nowrap w-1/3' } } },
  {
    id: 'value',
    header: 'Value',
    cell: ({ row }: any) => {
      const r = row.original
      if (r.field === 'email' && user.value?.id) {
        return h(AdminProtectedDataField, {
          targetUserId: user.value.id,
          field: 'email',
          label: 'Email',
          requiredPermission: 'viewEmail',
        }, {
          default: (slotProps: any) => h('span', slotProps.data?.email)
        })
      }
      return h('span', r.value)
    },
  },
]

const userInfoRows = computed(() => {
  if (!user.value) return []
  return [
    { label: 'ID', value: user.value.id, field: null },
    { label: 'Username', value: user.value.username, field: null },
    { label: 'Created At', value: new Date(user.value.createdAt).toLocaleString(), field: null },
    { label: 'Active', value: String(user.value.active), field: null },
    { label: 'Faser User ID', value: String(user.value.faserId), field: null },
    { label: 'Email Verified', value: String(user.value.emailVerified), field: null },
    { label: 'Friend Count', value: String(user.value.friendCount), field: null },
    { label: 'Email', value: '', field: 'email' },
  ]
})

onMounted(async () => {
  await refresh()
})
</script>

<template>
  <div class="overflow-auto h-full">
    <div class="flex gap-4 p-4 lg:p-6 flex-wrap">
      <UCard v-if="user" class="flex-1 min-w-[24rem] max-w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <p class="font-bold text-xl">User Information</p>
          <AdminSuspendUserButton :user-id="user.id" :active="user.active" :username="user.username" @updated="refresh" />
        </div>
      </template>
      <template #default>
        <UTable
          :data="userInfoRows"
          :columns="userInfoColumns"
          class="flex-1"
          :ui="{ td: 'py-1.5', th: 'py-1.5' }"
        />
      </template>
    </UCard>
    <UCard v-if="user" class="flex-1 min-w-[24rem] max-w-full">
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
        <div class="mt-3 pt-3 border-t border-default">
          <UButton variant="outline" size="sm" icon="material-symbols:group" label="View Friends" @click="showFriendsModal = true" />
        </div>
      </template>
    </UCard>
    <UCard v-if="user" class="flex-1 min-w-[24rem] max-w-full">
      <template #header>
        <p class="font-bold text-xl">Sessions</p>
      </template>
      <template #default>
        <AdminProtectedDataField :target-user-id="user.id" field="sessions" label="Session Details" required-permission="viewSessions" v-slot="{ data: sessionData }">
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
                    <AdminProtectedDataField :target-user-id="user.id" field="ipAddress" label="IP Address" required-permission="viewIpAddress" v-slot="{ data: ipData }">
                      <p v-for="s in ipData?.sessions" :key="s.sessionId">{{ s.ipAddress }}</p>
                    </AdminProtectedDataField>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </AdminProtectedDataField>
      </template>
    </UCard>
    <UCard v-if="user && adminPerms.has('viewProtocols')" class="flex-1 min-w-[24rem] max-w-full">
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

  <UModal v-model:open="showFriendsModal" title="Friends">
    <template #body>
      <AdminProtectedDataField :target-user-id="user?.id ?? ''" field="friends" label="Friends List" required-permission="viewFriends" v-slot="{ data: friendData }">
        <div class="flex flex-col gap-2">
          <div v-for="friend in friendData?.friends" :key="friend.user.userId">
            <NuxtLink :to="'/admin/users/' + friend.user.userId">
              <UCard variant="subtle">
                <div class="flex gap-3 items-center">
                  <UAvatar :src="friend.user.profilePictureUrl" size="md" />
                  <p class="font-bold">{{ friend.user.username }}</p>
                  <div class="ml-auto text-right">
                    <p class="text-xs text-muted">Friends Since</p>
                    <p class="text-sm">{{ new Date(friend.friendsSince).toLocaleString() }}</p>
                  </div>
                </div>
              </UCard>
            </NuxtLink>
          </div>
          <p v-if="!friendData?.friends?.length" class="text-muted text-sm">No friends</p>
        </div>
      </AdminProtectedDataField>
    </template>
  </UModal>
  </div>
</template>

<style scoped>

</style>
