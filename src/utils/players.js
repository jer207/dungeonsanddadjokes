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

// RPG rarity-inspired palette.
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

export const GLYPHS = ['shield', 'sword', 'axe', 'bow', 'staff', 'potion', 'helm', 'dagger']

export function avatarFor(name) {
  const h = hash(norm(name))
  return {
    color: AVATAR_COLORS[h % AVATAR_COLORS.length],
    glyph: GLYPHS[h % GLYPHS.length],
  }
}

export function initials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
