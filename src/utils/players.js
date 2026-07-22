// Player identity + cosmetic helpers (avatar colour + fantasy glyph).

import { DM_NAMES } from '../config.js'

const norm = (s) => (s || '').trim().toLowerCase()

export function isDM(name) {
  return DM_NAMES.map(norm).includes(norm(name))
}

// Resolve a typed name to its canonical roster name using the variant lists.
// Falls back to a tidied version of whatever was typed if no match is found.
export function resolveName(typed, players) {
  const n = norm(typed)
  for (const p of players) {
    const variants = (p.variants && p.variants.length ? p.variants : [p.name]).map(norm)
    if (variants.includes(n) || norm(p.name) === n) return p.name
  }
  return typed.trim()
}

export function isKnownPlayer(typed, players) {
  const n = norm(typed)
  return players.some((p) => {
    const variants = (p.variants && p.variants.length ? p.variants : [p.name]).map(norm)
    return variants.includes(n) || norm(p.name) === n
  })
}

// Deterministic hash so a given name always gets the same colour + glyph.
function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// RPG rarity-inspired palette (8 hues → plenty for a party).
const AVATAR_COLORS = [
  '#a335ee', // epic purple
  '#0070dd', // rare blue
  '#1eaf4f', // uncommon green
  '#ff8000', // legendary orange
  '#e0115f', // ruby
  '#009f9f', // teal
  '#c41e3a', // artifact red
  '#7d5fff', // arcane
]

import { ICON_NAMES } from './icons.js'

// Fallback avatar for a name not present in the assigned map.
export function avatarFor(name) {
  const h = hash(norm(name))
  return {
    color: AVATAR_COLORS[h % AVATAR_COLORS.length],
    icon: ICON_NAMES[h % ICON_NAMES.length],
  }
}

// Assign every name a UNIQUE (colour, icon) pair. Colours are handed out
// distinctly first (so small parties never share a colour); icons are picked
// pseudo-randomly from the name's hash. If a pair would collide, we probe for
// the next free one, guaranteeing no two players look alike.
export function buildAvatarMap(names) {
  const unique = [...new Set(names.filter(Boolean))].sort((a, b) => a.localeCompare(b))
  const nColors = AVATAR_COLORS.length
  const nIcons = ICON_NAMES.length
  const usedPairs = new Set()
  const map = {}

  unique.forEach((name, k) => {
    let colorIdx = k % nColors // distinct colours until we run out
    let iconIdx = hash(norm(name)) % nIcons
    let guard = 0
    while (usedPairs.has(`${colorIdx}|${iconIdx}`) && guard < nColors * nIcons) {
      iconIdx = (iconIdx + 1) % nIcons
      if (iconIdx === hash(norm(name)) % nIcons) colorIdx = (colorIdx + 1) % nColors
      guard++
    }
    usedPairs.add(`${colorIdx}|${iconIdx}`)
    map[name] = { color: AVATAR_COLORS[colorIdx], icon: ICON_NAMES[iconIdx] }
  })

  return map
}

export function initials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
