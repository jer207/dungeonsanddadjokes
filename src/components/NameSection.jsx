import { useState } from 'react'
import { isKnownPlayer, isDM } from '../utils/players.js'

export default function NameSection({ players, name, onSubmit, locked, dmPending }) {
  const [value, setValue] = useState('')
  const [warned, setWarned] = useState(false)
  const trimmed = value.trim()

  function handleSubmit(e) {
    e.preventDefault()
    if (!trimmed) return
    // Second step of the DM flow: they've typed "dm", now they name themselves.
    if (dmPending) {
      onSubmit(trimmed)
      return
    }
    if (isDM(trimmed) || isKnownPlayer(trimmed, players)) {
      onSubmit(trimmed)
      return
    }
    if (!warned) {
      setWarned(true)
      return
    }
    onSubmit(trimmed)
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
        <h2 className="section-heading">{dmPending ? 'Name yourself, Dungeon Master' : 'Who goes there?'}</h2>
        <p className="help-text">
          {dmPending
            ? 'The Sanctum knows its master. Which of the party do you play?'
            : 'Enter your name to begin your quest for a game night.'}
        </p>
        <form onSubmit={handleSubmit} className="name-form">
          <input
            className="text-input name-input"
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (warned) setWarned(false)
            }}
            placeholder={dmPending ? 'Your name' : 'Your name'}
            aria-label="Your name"
            autoComplete="off"
          />
          {warned && !dmPending && (
            <p className="help-text subtle">
              Hmm, that name isn't on the guest list. Check your spelling if you expected to
              be recognised — or tap again to continue anyway.
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={!trimmed}>
            {dmPending ? 'Enter the Sanctum' : warned ? 'Continue anyway' : 'Next'}
          </button>
        </form>
      </div>
    </section>
  )
}
