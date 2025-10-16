<script setup lang="ts">

</script>

<template>
  <UHeader title="Chanit.app"/>
  <slot />
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }}</p>
    </template>
    <div class="gap-2 flex flex-col lg:flex-row">
      <UButton icon="material-symbols:open-in-new" to="/impressum" label="Legal Notice" variant="link" color="neutral"/>
      <UButton icon="material-symbols:open-in-new" to="/privacy" label="Privacy Policy" variant="link" color="neutral"/>
      <UButton icon="material-symbols:open-in-new" to="/terms" label="Terms of Service" variant="link" color="neutral"/>
    </div>
    <template #right>
      <UButton
          to="https://faser.app/thiomains"
          :avatar="{
            src: 'https://cdn.faser.app/faser/static/logo.png?size=24'
          }"
          variant="soft"
          color="neutral"
          size="xl"
      />
      <UButton
          to="https://github.com/thiomains"
          :avatar="{
            src: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png'
          }"
          variant="soft"
          color="neutral"
          size="xl"
      />
    </template>
  </UFooter>
</template>

<style scoped>

</style>
