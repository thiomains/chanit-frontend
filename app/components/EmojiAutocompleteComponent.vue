<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { searchEmoji } from '~/data/emoji'

const props = defineProps({
  textareaEl: { type: Object, default: null },
  modelValue: { type: String, required: true }
})

const emit = defineEmits(['select'])

const results = ref([])
const activeIndex = ref(0)

const match = computed(() => {
  const el = props.textareaEl
  if (!el) return null
  const pos = el.selectionStart
  const textBefore = props.modelValue.substring(0, pos)
  const m = textBefore.match(/:([a-zA-Z0-9_]{2,})$/)
  if (!m || m.index === undefined) return null
  return { query: m[1], start: m.index, end: pos }
})

const visible = computed(() => match.value !== null && results.value.length > 0)

watch(match, (m) => {
  if (!m) {
    results.value = []
    activeIndex.value = 0
    return
  }
  results.value = searchEmoji(m.query, 5)
  activeIndex.value = 0
}, { deep: false })

function getCaretCoords(el) {
  const style = getComputedStyle(el)
  const mirror = document.createElement('div')

  const cssProps = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'wordWrap',
    'whiteSpace',
    'borderLeftWidth',
    'borderTopWidth',
    'paddingLeft',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'boxSizing',
    'lineHeight',
    'letterSpacing',
    'textIndent',
    'textTransform',
    'width',
  ]

  for (const prop of cssProps) {
    mirror.style[prop] = style[prop]
  }

  mirror.style.position = 'absolute'
  mirror.style.left = '-9999px'
  mirror.style.top = '0'
  mirror.style.visibility = 'hidden'
  mirror.style.overflow = 'hidden'
  mirror.style.whiteSpace = 'pre-wrap'

  mirror.textContent = el.value.substring(0, el.selectionStart)

  const marker = document.createElement('span')
  marker.textContent = '.'
  mirror.appendChild(marker)

  document.body.appendChild(mirror)

  const rect = el.getBoundingClientRect()
  const mirrorRect = mirror.getBoundingClientRect()
  const markerRect = marker.getBoundingClientRect()

  document.body.removeChild(mirror)

  return {
    left: rect.left + (markerRect.left - mirrorRect.left) - el.scrollLeft,
    top: rect.top + (markerRect.top - mirrorRect.top) - el.scrollTop,
  }
}

const coords = computed(() => {
  const m = match.value
  if (!m || !props.textareaEl) return { left: 0, top: 0 }
  return getCaretCoords(props.textareaEl)
})

function selectCurrent() {
  const m = match.value
  if (!m || results.value.length === 0) return
  const item = results.value[activeIndex.value]
  if (!item) return
  emit('select', { emoji: item.emoji, start: m.start, end: m.end })
  results.value = []
  activeIndex.value = 0
}

function handleSelect(index) {
  const m = match.value
  if (!m) return
  const item = results.value[index]
  if (!item) return
  emit('select', { emoji: item.emoji, start: m.start, end: m.end })
  results.value = []
  activeIndex.value = 0
}

function onKeydown(event) {
  if (!visible.value) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return
  }

  if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    event.stopPropagation()
    selectCurrent()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    results.value = []
    activeIndex.value = 0
    return
  }

  results.value = []
  activeIndex.value = 0
}

onMounted(() => {
  if (props.textareaEl) {
    props.textareaEl.addEventListener('keydown', onKeydown, true)
  }
})

watch(() => props.textareaEl, (el, prev) => {
  if (prev) prev.removeEventListener('keydown', onKeydown, true)
  if (el) el.addEventListener('keydown', onKeydown, true)
})

onUnmounted(() => {
  if (props.textareaEl) {
    props.textareaEl.removeEventListener('keydown', onKeydown, true)
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      :style="{ position: 'fixed', left: coords.left + 'px', top: coords.top + 'px', transform: 'translateY(calc(-100% - 4px))' }"
      class="z-50 w-56 max-h-48 overflow-y-auto bg-[var(--ui-bg-elevated)] border border-[var(--ui-border)] rounded-[var(--ui-radius)] shadow-lg p-1"
    >
      <div
        v-for="(item, i) in results"
        :key="item.slug"
        class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer"
        :class="{ 'bg-[var(--ui-bg-accented)]': i === activeIndex }"
        @click="handleSelect(i)"
        @mouseenter="activeIndex = i"
      >
        <span class="text-lg leading-none">{{ item.emoji }}</span>
        <span class="text-sm text-[var(--ui-text)]">:{{ item.slug }}:</span>
      </div>
    </div>
  </Teleport>
</template>
