import { useState } from 'react'
import { isKnownPlayer, isDM } from '../utils/players.js'

export default function NameSection({ players, name, onSubmit, locked }) {
  const [value, setValue] = useState(name || '')
  const trimmed = value.trim()
  const known = trimmed && (isDM(trimmed) || isKnownPlayer(trimmed, players))

  function handleSubmit(e) {
    e.preventDefault()
    if (!trimmed) return
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
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            autoComplete="off"
          />
          {trimmed && !known && !isDM(trimmed) && (
            <p className="help-text subtle">
              Hmm, that name isn't on the guest list — you can still continue, but check
              your spelling if you expected to be recognised.
            </p>
          )}
          <button className="btn btn-primary" type="submit" disabled={!trimmed}>
            {locked ? 'Change name' : 'Next'}
          </button>
        </form>
      </div>
    </section>
  )
}
