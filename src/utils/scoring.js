// Results ranking + achievement logic.

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

// Compute per-player badges plus the headline achievement banners.
export function buildAchievements(players, availability, submissions) {
  const badges = {} // name -> { silverRing, goldBorder, star }
  const banners = [] // { icon, title, text }

  if (submissions.length === 0) return { badges, banners }

  const ordered = [...submissions].sort((a, b) => a.order - b.order)
  const counts = selectionCounts(availability, submissions)

  // First to submit -> silver ring (awarded as soon as anyone submits).
  const first = ordered[0]
  badges[first.name] = { ...(badges[first.name] || {}), silverRing: true }
  banners.push({
    icon: 'silver',
    who: [first.name],
    title: 'The Early Bird',
    text: `First to answer the call. Silver-ringed for sheer initiative.`,
  })

  // Roster size: prefer the invited roster; fall back to who has submitted.
  const rosterSize = players.length || submissions.length
  const everyoneIn = submissions.length >= rosterSize && rosterSize > 0

  if (everyoneIn) {
    const values = [...counts.values()]
    const max = Math.max(...values)
    const min = Math.min(...values)

    // Most dates -> gold border(s).
    const champions = [...counts.entries()].filter(([, v]) => v === max).map(([n]) => n)
    for (const n of champions) {
      badges[n] = { ...(badges[n] || {}), goldBorder: true }
    }
    banners.push({
      icon: 'gold',
      who: champions,
      title: champions.length > 1 ? 'The Generous Ones' : 'The Generous One',
      text: `Offered the most days (${max}). Gold-bordered for flexibility.`,
    })

    // A gold + silver player earns a star.
    for (const n of champions) {
      if (badges[n] && badges[n].silverRing) badges[n].star = true
    }

    // Last to submit -> heckle.
    const last = ordered[ordered.length - 1]
    if (ordered.length > 1) {
      banners.push({
        icon: 'snail',
        who: [last.name],
        title: 'Fashionably Late',
        text: `Kept the whole party waiting. The tavern keeper is not impressed.`,
      })
    }

    // Fewest dates -> heckle (skip if it's the same as the champion, i.e. all equal).
    if (min !== max) {
      const scrooges = [...counts.entries()].filter(([, v]) => v === min).map(([n]) => n)
      banners.push({
        icon: 'scroll',
        who: scrooges,
        title: 'The Busy Adventurer',
        text: `Offered the fewest days (${min}). Too much questing, not enough gaming?`,
      })
    }
  }

  return { badges, banners }
}
