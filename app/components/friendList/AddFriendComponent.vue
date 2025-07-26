<script setup>

const { $axios } = useNuxtApp()
const session = useState('session', () => null)

let collapsed = ref(true)
let username = ref("")

function collapse() {
  collapsed.value = true
}

async function addFriend() {
  if (collapsed.value) {
    collapsed.value = false
    return;
  }

  console.log("ee")

  try {
    const res = await $axios.post('/user/' + username.value + '/friends', {}, {
      headers: {
        Authorization: `Bearer ${session.value.session.accessToken}`,
        Session: session.value.session.sessionId
      }
    })
    console.log(res)
  } catch (e) {
    console.log(e)
  }



}

</script>

<template>
  <div class="flex items-center gap-2">
    <span :class="{ 'opacity-0': collapsed }" @click="collapse" class="material-symbols-outlined select-none transition-friend-add">close</span>
    <div :class="{ 'p-2': !collapsed, 'gap-1': !collapsed, 'cursor-pointer': !collapsed, 'h-16': !collapsed, 'h-12': collapsed }" class="bg-[var(--bg)] rounded-full items-center justify-center flex select-none transition-friend-add">
      <input :class="{ 'w-0': collapsed, 'w-32': !collapsed, 'p-2': !collapsed, 'opacity-0': collapsed }" class="h-12 rounded-full transition-friend-add" type="text" placeholder="Add a friend" autocomplete="false" name="search" v-model="username">
      <div @click="addFriend" :class="{ 'w-12': !collapsed, 'w-26': collapsed, 'bg-[var(--bg-light)]': !collapsed, 'bg-[var(--bg)]': collapsed }" class="h-12 w-12 aspect-square rounded-full items-center justify-center flex cursor-pointer select-none transition-friend-add">
        <span class="material-symbols-outlined">person_add</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

.transition-friend-add {
  transition: all 350ms cubic-bezier(.17,.67,.02,.99)
}

</style>