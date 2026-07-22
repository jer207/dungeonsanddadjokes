import { useState } from 'react'
import { isKnownPlayer, isDM } from '../utils/players.js'

export default function NameSection({ players, name, onSubmit, locked }) {
  const [value, setValue] = useState(name || '')
  const [warned, setWarned] = useState(false)
  const trimmed = value.trim()

  function handleSubmit(e) {
    e.preventDefault()
    if (!trimmed) return
    // Recognised names (and the DM) go straight through.
    if (isDM(trimmed) || isKnownPlayer(trimmed, players)) {
      onSubmit(trimmed)
      return
    }
    // First tap on an unrecognised name: show the note and let them confirm.
    if (!warned) {
      setWarned(true)
      return
    }
    onSubmit(trimmed)
  }

  return (
    <section className="section section-name" id="section-name">
      <div className="section-inner narrow">
        <h2 className="section-heading">Who goes there?</h2>
        <p className="help-text">Enter your name to begin your quest for a game night.</p>
        <form onSubmit={handleSubmit} className="name-form">
          <input
            className="text-input name-input"
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (warned) setWarned(false) // reset the note once they edit again
            }}
            placeholder="Your name"
            aria-label="Your name"
            autoComplete="off"
          />
          {warned && (
            <p className="help-text subtle">
              Hmm, that name isn't on the guest list. Check your spelling if you expected to
              be recognised — or tap again to continue anyway.
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={!trimmed}>
            {warned ? 'Continue anyway' : locked ? 'Change name' : 'Next'}
          </button>
        </form>
      </div>
    </section>
  )
}
