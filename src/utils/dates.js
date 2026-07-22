// Date helpers. All dates are handled as 'YYYY-MM-DD' strings in LOCAL time to
// avoid timezone drift (never `new Date('YYYY-MM-DD')`, which parses as UTC).

export function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Every date from start..end inclusive.
export function dateRange(startISO, endISO) {
  if (!startISO || !endISO) return []
  const start = fromISO(startISO)
  const end = fromISO(endISO)
  const out = []
  const cur = new Date(start)
  let guard = 0
  while (cur <= end && guard < 1000) {
    out.push(toISO(cur))
    cur.setDate(cur.getDate() + 1)
    guard++
  }
  return out
}

// Group an ordered list of ISO dates into weeks that always start on Sunday.
// Leading days before the first Sunday are padded with null so columns line up.
export function toWeeks(isoDates) {
  if (isoDates.length === 0) return []
  const weeks = []
  let week = []
  const first = fromISO(isoDates[0])
  // pad the front so the first real date lands under its weekday column
  for (let i = 0; i < first.getDay(); i++) week.push(null)
  for (const iso of isoDates) {
    week.push(iso)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function monthName(iso) {
  return MONTHS[fromISO(iso).getMonth()]
}

// Short label shown inside a calendar cell, e.g. "7/15".
export function shortLabel(iso) {
  const d = fromISO(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// A stable index used to alternate the month background shade. Uses absolute
// year*12+month so consecutive months always alternate even across a year gap.
export function monthShadeIndex(iso) {
  const d = fromISO(iso)
  return (d.getFullYear() * 12 + d.getMonth()) % 2
}

export function weekdayLabels() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

export function prettyDate(iso) {
  const d = fromISO(iso)
  const wd = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]
  return `${wd}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}
