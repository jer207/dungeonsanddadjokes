// Remembers which achievement modals a person has already dismissed, so each
// pops exactly once. Stored in localStorage (per device — everyone uses their
// own phone) and SCOPED to the calendar's summon timestamp (the "epoch").
//
// Scoping by epoch is what lets a Purge reset the modals for everyone without
// reaching their devices: the next Conjure stamps a new SummonedAt, the epoch
// changes, and every device quietly forgets the old dismissals.

const KEY = 'dnd-seen-achievements-v2'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch (e) {
    return {}
  }
}

function write(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch (e) {
    /* ignore quota / private-mode errors */
  }
}

// Return the store for the current epoch, discarding any older epoch's data.
function scoped(epoch) {
  const store = read()
  if (store.epoch !== epoch) return { epoch, byName: {} }
  return store
}

export function getSeen(name, epoch) {
  return new Set(scoped(epoch).byName[name] || [])
}

export function markSeen(name, id, epoch) {
  const store = scoped(epoch)
  const set = new Set(store.byName[name] || [])
  set.add(id)
  store.byName[name] = [...set]
  store.epoch = epoch
  write(store)
}
