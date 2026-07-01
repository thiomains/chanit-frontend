<script setup>
import { ref } from 'vue'
import { emojiGroups } from '~/data/emoji'

const props = defineProps({
  onSelect: Function
})

const open = ref(false)

// --- Resize state ---
const LS_KEY = 'emoji-picker-size'
const DEFAULT_W = 320
const DEFAULT_H = 320
const MIN_W = 180
const MIN_H = 180
const BTN_SIZE = 42

function loadSize() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.w === 'number' && typeof parsed.h === 'number') {
        return { w: Math.max(MIN_W, parsed.w), h: Math.max(MIN_H, parsed.h) }
      }
    }
  } catch { /* ignore */ }
  return { w: DEFAULT_W, h: DEFAULT_H }
}

function saveSize(w, h) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ w, h })) } catch { /* ignore */ }
}

const initial = loadSize()
const pickerWidth = ref(initial.w)
const pickerHeight = ref(initial.h)
const resizing = ref(false)

function onResizeStart(dir, e) {
  e.preventDefault()
  e.stopPropagation()
  resizing.value = true
  const startX = e.clientX
  const startY = e.clientY
  const startW = pickerWidth.value
  const startH = pickerHeight.value

  function onMove(ev) {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    if (dir === 'w' || dir === 'nw') {
      pickerWidth.value = Math.max(MIN_W, startW - dx)
    }
    if (dir === 'n' || dir === 'nw') {
      pickerHeight.value = Math.max(MIN_H, startH - dy)
    }
  }

  function onUp() {
    resizing.value = false
    saveSize(pickerWidth.value, pickerHeight.value)
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>

<template>
  <UPopover
    v-model:open="open"
    class="mt-auto"
    :content="{ side: 'top', align: 'end', sideOffset: 8 }"
    arrow
  >
    <UButton
      icon="material-symbols:sentiment-excited-rounded"
      variant="link"
      color="neutral"
      size="xl"
    />

    <template #content="{ close }">
      <div
        v-if="open"
        class="overflow-hidden flex flex-col relative"
        :style="{ width: pickerWidth + 'px', height: pickerHeight + 'px' }"
        :class="{ 'select-none': resizing }"
      >
        <!-- Resize edges -->
        <div
          class="absolute top-0 left-0 right-0 h-1.5 cursor-n-resize z-10"
          @mousedown="onResizeStart('n', $event)"
        />
        <div
          class="absolute top-0 left-0 bottom-0 w-1.5 cursor-w-resize z-10"
          @mousedown="onResizeStart('w', $event)"
        />
        <div
          class="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10"
          @mousedown="onResizeStart('nw', $event)"
        />

        <div class="flex-1 overflow-y-auto min-h-0 px-0.5">
          <div v-for="group in emojiGroups" :key="group.slug">
            <p class="text-md font-bold px-2 pt-2 pb-1 text-dimmed">
              {{ group.name }}
            </p>
            <div class="flex flex-wrap gap-0.5 px-1">
              <button
                v-for="item in group.emojis"
                :key="item.slug"
                :style="{ width: BTN_SIZE + 'px', height: BTN_SIZE + 'px' }"
                class="text-3xl leading-none flex items-center justify-center rounded hover:bg-[var(--ui-bg-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-border-inverted)] shrink-0"
                @click="close(); props.onSelect(item.emoji)"
              >
                {{ item.emoji }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
