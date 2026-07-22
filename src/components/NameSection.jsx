import { useState } from 'react'
import { isKnownPlayer, isDM } from '../utils/players.js'

export default function NameSection({ players, name, onSubmit, locked, dmPending }) {
  const [value, setValue] = useState('')
  const [rejected, setRejected] = useState(false)
  // The field starts read-only so the browser never classifies it as a
  // login/address/payment field and pops its autofill bar. The first focus
  // makes it editable (and opens the keyboard) before any keystroke.
  const [editable, setEditable] = useState(false)
  const trimmed = value.trim()

  function handleSubmit(e) {
    e.preventDefault()
    if (!trimmed) return
    // The DM's own name (step two of the DM flow) must be on the roster.
    if (dmPending) {
      if (isKnownPlayer(trimmed, players)) {
        onSubmit(trimmed)
        return
      }
      setRejected(true)
      return
    }
    // "dm" opens the Dungeon Master flow; any other name must be on the roster.
    if (isDM(trimmed)) {
      onSubmit(trimmed)
      return
    }
    if (isKnownPlayer(trimmed, players)) {
      onSubmit(trimmed)
      return
    }
    setRejected(true)
  }

  // Once a name is locked in, this section is just a welcome. Changing who you
  // are is handled by the Log out button up top.
  if (locked) {
    return (
      <section className="section section-name" id="section-name">
        <div className="section-inner narrow">
          <h2 className="section-heading">Welcome, {name}!</h2>
          <p className="help-text">The tavern doors swing open. Mark your nights below.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section section-name" id="section-name">
      <div className="section-inner narrow">
        <h2 className="section-heading">
          {dmPending ? 'And your name, Dungeon Master?' : 'Who goes there?'}
        </h2>
        <p className="help-text">
          {dmPending
            ? 'You hold the Sanctum. Now name your own character so your ' +
              'availability counts — type your name as it appears on the roster.'
            : 'Enter your name to begin your quest for a game night.'}
        </p>
        <form onSubmit={handleSubmit} className="name-form" autoComplete="off">
          <input
            className="text-input name-input"
            type="text"
            value={value}
            readOnly={!editable}
            onFocus={(e) => {
              e.currentTarget.removeAttribute('readonly')
              setEditable(true)
            }}
            onChange={(e) => {
              setValue(e.target.value)
              if (rejected) setRejected(false)
            }}
            placeholder="e.g. Jim"
            aria-label="Your name"
            name="adventurer"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
          />
          {rejected && (
            <p className="help-text subtle">
              That name isn't on the roster. Check your spelling and type it exactly as
              it appears — only invited adventurers may enter.
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={!trimmed}>
            {dmPending ? 'Enter the Sanctum' : 'Next'}
          </button>
        </form>
      </div>
    </section>
  )
}
