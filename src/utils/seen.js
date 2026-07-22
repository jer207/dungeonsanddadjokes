// Remembers which achievement modals a given person has already dismissed, so
// each one pops exactly once. Keyed by canonical name in localStorage — per
// device, which suits a friends' scheduler where everyone uses their own phone.

const KEY = 'dnd-seen-achievements-v1'

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch (e) {
    return {}
  }
}

// The set of achievement ids this person has already seen.
export function getSeen(name) {
  return new Set(readAll()[name] || [])
}

// Mark one achievement id as seen for this person.
export function markSeen(name, id) {
  const all = readAll()
  const set = new Set(all[name] || [])
  set.add(id)
  all[name] = [...set]
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch (e) {
    /* ignore quota / private-mode errors */
  }
}
