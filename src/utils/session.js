// Remembers who is logged in on this device so a refresh or a return visit
// lands you back where you were instead of at the name prompt.

const KEY = 'dnd-session-v1'

export function readSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null
  } catch (e) {
    return null
  }
}

export function saveSession(name, dmMode) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ name, dmMode: !!dmMode }))
  } catch (e) {
    /* ignore quota / private-mode errors */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch (e) {
    /* ignore */
  }
}
