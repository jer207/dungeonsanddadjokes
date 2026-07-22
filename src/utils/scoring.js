// Results ranking + achievement logic.

import { fromISO } from './dates.js'

// Fri, Sat, or Sun. Day-of-week: 0 = Sun … 6 = Sat.
function isWeekend(iso) {
  const dow = fromISO(iso).getDay()
  return dow === 0 || dow === 5 || dow === 6
}

// Every achievement that exists, honors first then gags. Used to show which
// ones remain locked. `hint` says how to earn it, in general terms (no names).
export const ACHIEVEMENT_CATALOG = [
  { id: 'early-bird', icon: '🐦', title: 'The Early Bird', tone: 'honor', hint: 'Be the first player to answer the call.' },
  { id: 'weekend-warrior', icon: '⚔️', title: 'Weekend Warrior', tone: 'honor', hint: 'Offer only weekend days — Fri, Sat, Sun.' },
  { id: 'swift-raven', icon: '⚡', title: 'Swift Raven', tone: 'honor', hint: 'Answer within a day of the calendar being summoned.' },
  { id: 'generous', icon: '🏆', title: 'The Generous One', tone: 'honor', hint: 'Offer the most days once the whole party is in.' },
  { id: 'master-sniper', icon: '🎯', title: 'Master Sniper', tone: 'gag', hint: 'Be the DM who submits before any player.' },
  { id: 'fence-sitter', icon: '🤷', title: 'The Fence-Sitter', tone: 'gag', hint: 'Mark more maybes than yeses.' },
  { id: 'contrarian', icon: '🗓️', title: 'The Contrarian', tone: 'gag', hint: 'Offer days, but not a single weekend.' },
  { id: 'lone-wolf', icon: '🐺', title: 'The Lone Wolf', tone: 'gag', hint: 'Offer only days nobody else picks (once all are in).' },
  { id: 'fashionably-late', icon: '🐌', title: 'Fashionably Late', tone: 'gag', hint: 'Be the last of the party to submit.' },
  { id: 'busy-adventurer', icon: '📜', title: 'The Busy Adventurer', tone: 'gag', hint: 'Offer the fewest days once everyone is in.' },
]

// Build the ranked results for the calendar dates.
//   dates        : ordered array of ISO dates currently in the calendar
//   availability : [ { name, date, status } ]  (status = 'yes' | 'maybe')
//   submissions  : [ { name, timestamp, order } ]  (everyone who has submitted)
//
// A "no" is any submitted player who did NOT mark that date. So the divisor of
// each progress bar is the number of players who have submitted.
export function buildResults(dates, availability, submissions) {
  const submittedNames = submissions.map((s) => s.name)
  const total = submittedNames.length

  const byDate = new Map()
  for (const iso of dates) byDate.set(iso, { date: iso, yes: [], maybe: [] })

  for (const a of availability) {
    const row = byDate.get(a.date)
    if (!row) continue
    if (a.status === 'yes') row.yes.push(a.name)
    else if (a.status === 'maybe') row.maybe.push(a.name)
  }

  const rows = dates.map((iso) => {
    const row = byDate.get(iso)
    const yesCount = row.yes.length
    const maybeCount = row.maybe.length
    const noCount = Math.max(0, total - yesCount - maybeCount)
    // Yes weighted twice as heavily as maybe.
    const score = yesCount * 2 + maybeCount
    return { ...row, yesCount, maybeCount, noCount, total, score }
  })

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.yesCount !== a.yesCount) return b.yesCount - a.yesCount
    return a.date < b.date ? -1 : 1 // earlier date first
  })

  return rows
}

// Number of dates a player marked (yes OR maybe).
export function selectionCounts(availability, submissions) {
  const counts = new Map()
  for (const s of submissions) counts.set(s.name, 0)
  for (const a of availability) {
    counts.set(a.name, (counts.get(a.name) || 0) + 1)
  }
  return counts
}

// Compute per-player avatar badges plus the achievement list.
//
//   config : { dmName, summonedAt }  (both optional)
//
// Each achievement carries a stable `id` (so the front end can remember which
// modals a person has already dismissed) and a `tone`: 'honor' for earned
// distinctions, 'gag' for the good-natured heckles. Honors are listed first.
export function buildAchievements(players, availability, submissions, config = {}) {
  const badges = {} // name -> { silverRing, goldBorder, star }
  const honors = [] // { id, tone, icon, who, title, text }
  const gags = []

  if (submissions.length === 0) return { badges, banners: [] }

  const dmName = config.dmName || null
  const summonedAt = config.summonedAt ? new Date(config.summonedAt).getTime() : null

  const ordered = [...submissions].sort((a, b) => a.order - b.order)
  const counts = selectionCounts(availability, submissions) // name -> #days offered
  const submitted = new Set(submissions.map((s) => s.name))

  // Per-player selection rows, and how many players offered each date.
  const byName = new Map()
  const dateOfferers = new Map()
  for (const a of availability) {
    if (!byName.has(a.name)) byName.set(a.name, [])
    byName.get(a.name).push(a)
    dateOfferers.set(a.date, (dateOfferers.get(a.date) || 0) + 1)
  }
  const picks = (name) => byName.get(name) || []

  // --- Early Bird: the first NON-DM to submit ------------------------------
  const firstPlayer = ordered.find((s) => s.name !== dmName)
  if (firstPlayer) {
    badges[firstPlayer.name] = { ...(badges[firstPlayer.name] || {}), silverRing: true }
    honors.push({
      id: 'early-bird',
      tone: 'honor',
      icon: '🐦',
      who: [firstPlayer.name],
      title: 'The Early Bird',
      text: 'First to answer the call. The party moves because you moved.',
    })
  }

  // --- Master Sniper: the DM, only when the DM submitted first of all -------
  if (dmName && ordered.length && ordered[0].name === dmName) {
    gags.push({
      id: 'master-sniper',
      tone: 'gag',
      icon: '🎯',
      who: [dmName],
      title: 'Master Sniper',
      text:
        'Quick to the draw the moment the calendar rose — but sniping glory ' +
        'from the players is frowned upon by Lolth.',
    })
  }

  // --- Weekend Warrior: every day offered is a weekend day ------------------
  const weekendWarriors = submissions
    .map((s) => s.name)
    .filter((n) => picks(n).length > 0 && picks(n).every((a) => isWeekend(a.date)))
  if (weekendWarriors.length) {
    honors.push({
      id: 'weekend-warrior',
      tone: 'honor',
      icon: '⚔️',
      who: weekendWarriors,
      title: 'Weekend Warrior',
      text: 'Fri, Sat, Sun, nothing else. A true servant of the weekend.',
    })
  }

  // --- Swift Raven: submitted within 24h of the summon ---------------------
  if (summonedAt) {
    const swift = submissions
      .filter((s) => {
        const t = s.timestamp ? new Date(s.timestamp).getTime() : NaN
        return t >= summonedAt && t - summonedAt <= 24 * 60 * 60 * 1000
      })
      .map((s) => s.name)
    if (swift.length) {
      honors.push({
        id: 'swift-raven',
        tone: 'honor',
        icon: '⚡',
        who: swift,
        title: 'Swift Raven',
        text: 'Answered within a day of the call. Reliable as sunrise.',
      })
    }
  }

  // --- Fence-Sitter: more maybes than yeses --------------------------------
  const fenceSitters = submissions
    .map((s) => s.name)
    .filter((n) => {
      const list = picks(n)
      const yes = list.filter((a) => a.status === 'yes').length
      const maybe = list.filter((a) => a.status === 'maybe').length
      return maybe > yes
    })
  if (fenceSitters.length) {
    gags.push({
      id: 'fence-sitter',
      tone: 'gag',
      icon: '🤷',
      who: fenceSitters,
      title: 'The Fence-Sitter',
      text: 'More maybes than yeses. Commitment is a dragon you’d rather not fight.',
    })
  }

  // --- Contrarian: at least one day offered, but not one weekend -----------
  const contrarians = submissions
    .map((s) => s.name)
    .filter((n) => picks(n).length > 0 && picks(n).every((a) => !isWeekend(a.date)))
  if (contrarians.length) {
    gags.push({
      id: 'contrarian',
      tone: 'gag',
      icon: '🗓️',
      who: contrarians,
      title: 'The Contrarian',
      text: 'Not one weekend. We usually play them. Bold.',
    })
  }

  // Roster: everyone in the Players tab (the DM lives there too).
  const rosterSize = players.length || submissions.length
  const everyoneIn = submitted.size >= rosterSize && rosterSize > 0

  // --- Fashionably Late ----------------------------------------------------
  // Once every player but one has answered, that straggler is the inevitable
  // last — so we can crown them before they even submit.
  if (everyoneIn && ordered.length > 1) {
    gags.push({
      id: 'fashionably-late',
      tone: 'gag',
      icon: '🐌',
      who: [ordered[ordered.length - 1].name],
      title: 'Fashionably Late',
      text: 'Kept the whole party waiting. The tavern keeper is not impressed.',
    })
  } else if (!everyoneIn && players.length > 1) {
    const missing = players.map((p) => p.name).filter((n) => !submitted.has(n))
    if (missing.length === 1) {
      gags.push({
        id: 'fashionably-late',
        tone: 'gag',
        icon: '🐌',
        who: [missing[0]],
        title: 'Fashionably Late',
        text: 'The whole party is waiting on you. The tavern keeper is not impressed.',
      })
    }
  }

  // --- End-state honors and heckles (need the whole party in) --------------
  if (everyoneIn) {
    const values = [...counts.values()]
    const max = Math.max(...values)
    const min = Math.min(...values)

    // Most days -> gold border(s).
    const champions = [...counts.entries()].filter(([, v]) => v === max).map(([n]) => n)
    for (const n of champions) badges[n] = { ...(badges[n] || {}), goldBorder: true }
    honors.push({
      id: 'generous',
      tone: 'honor',
      icon: '🏆',
      who: champions,
      title: champions.length > 1 ? 'The Generous Ones' : 'The Generous One',
      text: `Offered the most days (${max}). The most giving soul at the table.`,
    })
    // Gold + silver earns a star.
    for (const n of champions) {
      if (badges[n] && badges[n].silverRing) badges[n].star = true
    }

    // Lone Wolf: every day offered was offered by nobody else.
    const loners = submissions
      .map((s) => s.name)
      .filter(
        (n) => picks(n).length > 0 && picks(n).every((a) => (dateOfferers.get(a.date) || 0) === 1),
      )
    if (loners.length) {
      gags.push({
        id: 'lone-wolf',
        tone: 'gag',
        icon: '🐺',
        who: loners,
        title: 'The Lone Wolf',
        text: 'Every night you offered, you offered alone. Herding you is impossible.',
      })
    }

    // Fewest days -> heckle (skip when everyone offered the same count).
    if (min !== max) {
      const scrooges = [...counts.entries()].filter(([, v]) => v === min).map(([n]) => n)
      gags.push({
        id: 'busy-adventurer',
        tone: 'gag',
        icon: '📜',
        who: scrooges,
        title: 'The Busy Adventurer',
        text: `Offered the fewest days (${min}). Too much questing, not enough gaming?`,
      })
    }
  }

  return { badges, banners: [...honors, ...gags] }
}
