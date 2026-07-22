import { useState } from 'react'
import { isKnownPlayer, isDM } from '../utils/players.js'

export default function NameSection({ players, name, onSubmit, locked, dmPending }) {
  const [value, setValue] = useState('')
  const [rejected, setRejected] = useState(false)
  const trimmed = value.trim()

  function submit() {
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
    if (isDM(trimmed) || isKnownPlayer(trimmed, players)) {
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
        <form
          className="name-form"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          {/* A contenteditable div, not an <input>, so mobile browsers never
              treat it as a login/address/payment field and pop the autofill
              bar. Uncontrolled: we read it on input and never write back, so
              the caret never jumps. */}
          <div
            className="text-input name-input name-editable"
            contentEditable
            role="textbox"
            aria-label="Your name"
            data-placeholder="e.g. Jim"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="words"
            suppressContentEditableWarning
            onInput={(e) => {
              setValue(e.currentTarget.textContent || '')
              if (rejected) setRejected(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            onPaste={(e) => {
              e.preventDefault()
              const text = (e.clipboardData || window.clipboardData).getData('text')
              document.execCommand('insertText', false, text.replace(/\s+/g, ' '))
            }}
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
