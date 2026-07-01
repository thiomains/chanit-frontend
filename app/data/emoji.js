import rawByGroup from 'unicode-emoji-json/data-by-group.json'
import rawByEmoji from 'unicode-emoji-json/data-by-emoji.json'

const groups = rawByGroup

export const emojiGroups = Object.values(groups).map((group) => ({
  name: group.name,
  slug: group.slug,
  emojis: group.emojis.map((e) => ({
    emoji: e.emoji,
    name: e.name,
    slug: e.slug,
  })),
}))

export const emojiList = emojiGroups.flatMap((g) => g.emojis)

export function emojiByChar(char) {
  const entry = rawByEmoji[char]
  if (!entry) return undefined
  return {
    emoji: char,
    name: entry.name,
    slug: entry.slug,
  }
}

function matchQuality(item, query) {
  const slug = item.slug
  const name = item.name.toLowerCase()
  if (slug === query) return 100
  if (name === query) return 95
  if (slug.startsWith(query)) return 80
  if (name.startsWith(query)) return 75
  if (slug.includes(query)) return 50
  if (name.includes(query)) return 45
  return 0
}

export function searchEmoji(query, limit = 5) {
  const q = query.toLowerCase().replace(/\s+/g, '_')
  const scored = emojiList
    .map((item) => ({ item, score: matchQuality(item, q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((entry) => entry.item)
}
