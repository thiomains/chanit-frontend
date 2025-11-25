<script setup lang="ts">

import SidebarChannelSelectComponent from "~/components/SidebarChannelSelectComponent.vue";
</script>

<template>
  <div class="layer-0">
    <div class="w-screen h-screen flex gap-2 p-2">
      <!-- <div class="w-xs h-full shrink-0">

      </div>
      <div class="w-20 h-full shrink-0">

      </div> -->
      <div class="w-xs h-full shrink-0 flex flex-col gap-2">
        <SidebarChannelSelectComponent class="w-full"/>
        <SidebarProfileCardComponent />
      </div>
      <div class="h-full w-full shrink">
        <slot />
      </div>
    </div>
    <NotificationSoundComponent />
  </div>


</template>

<style scoped>

</style>