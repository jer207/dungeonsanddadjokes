// ---------------------------------------------------------------------------
//  API LAYER
// ---------------------------------------------------------------------------
//  Talks to the Google Apps Script web app when APPS_SCRIPT_URL is configured.
//  Otherwise falls back to localStorage so the site is fully usable in DEMO
//  MODE (handy for local development and for kicking the tyres before the
//  Google Sheet is wired up).
//
//  Shape of the data returned by getState():
//    {
//      players:      [ { name, variants:[...] } ],
//      config:       { startDate: 'YYYY-MM-DD'|null, endDate: 'YYYY-MM-DD'|null },
//      availability: [ { name, date: 'YYYY-MM-DD', status: 'yes'|'maybe' } ],
//      submissions:  [ { name, timestamp, order } ],
//    }
// ---------------------------------------------------------------------------

import { APPS_SCRIPT_URL, isConfigured } from './config.js'

const LS_KEY = 'dnd-scheduler-demo-v1'

// Seed roster used only in DEMO MODE. In production the roster lives in the
// "Players" tab of the Google Sheet.
const DEMO_PLAYERS = [
  { name: 'Jim', variants: ['Jim', 'James', 'Jim LaMarca', 'James Lamarca'] },
  { name: 'Aria', variants: ['Aria', 'Ari'] },
  { name: 'Bram', variants: ['Bram', 'Abraham'] },
  { name: 'Nyx', variants: ['Nyx', 'Nix'] },
]

function readDemo() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    /* ignore */
  }
  return {
    players: DEMO_PLAYERS,
    config: { startDate: null, endDate: null, dmName: null, summonedAt: null },
    availability: [],
    submissions: [],
  }
}

function writeDemo(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

// --- remote helpers --------------------------------------------------------

async function remoteGet() {
  const res = await fetch(APPS_SCRIPT_URL, { method: 'GET' })
  if (!res.ok) throw new Error(`GET failed: ${res.status}`)
  return res.json()
}

async function remotePost(payload) {
  // text/plain avoids a CORS preflight — Apps Script parses the raw body.
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  const data = await res.json()
  if (data && data.error) throw new Error(data.error)
  return data
}

// --- public API ------------------------------------------------------------

export async function getState() {
  if (isConfigured()) {
    const data = await remoteGet()
    const config = data.config || {}
    return {
      players: data.players || [],
      config: {
        startDate: config.startDate ?? null,
        endDate: config.endDate ?? null,
        dmName: config.dmName ?? null,
        summonedAt: config.summonedAt ?? null,
      },
      availability: data.availability || [],
      submissions: data.submissions || [],
    }
  }
  return readDemo()
}

export async function submitAvailability(name, selections) {
  // selections: [ { date, status } ] (only yes/maybe entries)
  if (isConfigured()) {
    return remotePost({ action: 'submit', name, selections })
  }
  const state = readDemo()
  state.availability = state.availability.filter((a) => a.name !== name)
  for (const s of selections) {
    state.availability.push({ name, date: s.date, status: s.status })
  }
  if (!state.submissions.find((s) => s.name === name)) {
    state.submissions.push({
      name,
      timestamp: new Date().toISOString(),
      order: state.submissions.length + 1,
    })
  } else {
    // keep original order, refresh timestamp
    const sub = state.submissions.find((s) => s.name === name)
    sub.timestamp = new Date().toISOString()
  }
  writeDemo(state)
  return { ok: true }
}

export async function setDateRange(startDate, endDate, dmName) {
  if (isConfigured()) {
    return remotePost({ action: 'setRange', startDate, endDate, dmName })
  }
  const state = readDemo()
  const prev = state.config || {}
  state.config = {
    startDate,
    endDate,
    dmName: dmName || prev.dmName || null,
    // Stamp the summon time once, on first conjure; preserve it on later edits.
    summonedAt: prev.summonedAt || new Date().toISOString(),
  }
  writeDemo(state)
  return { ok: true }
}

export async function purge() {
  if (isConfigured()) {
    return remotePost({ action: 'purge' })
  }
  const state = readDemo()
  state.config = { startDate: null, endDate: null, dmName: null, summonedAt: null }
  state.availability = []
  state.submissions = []
  writeDemo(state)
  return { ok: true }
}
