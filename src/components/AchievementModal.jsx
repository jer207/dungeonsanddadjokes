import { useRef, useState } from 'react'
import ProfileIcon from './ProfileIcon.jsx'

function joinNames(names) {
  if (!names || names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

// One achievement, shown as a dismissible modal. Close with the X, the Close
// button, or by swiping the card away in any direction.
export default function AchievementModal({ banner, badges = {}, onClose }) {
  const who = banner.who || []
  const start = useRef(null)
  const [drag, setDrag] = useState(0)

  function down(e) {
    start.current = { x: e.clientX, y: e.clientY }
  }
  function move(e) {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    setDrag(Math.abs(dx) >= Math.abs(dy) ? dx : dy)
  }
  function up() {
    if (Math.abs(drag) > 90) {
      onClose()
      return
    }
    setDrag(0)
    start.current = null
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className={`modal-card ach-modal ach-modal-${banner.tone}`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{
          transform: drag ? `translate(${drag}px, 0)` : undefined,
          opacity: drag ? Math.max(0.35, 1 - Math.abs(drag) / 320) : 1,
        }}
      >
        <button type="button" className="ach-modal-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="ach-modal-icon" aria-hidden="true">
          {banner.icon}
        </div>
        <div className="ach-modal-kicker">
          Achievement unlocked{who.length ? ` by ${joinNames(who)}` : ''}
        </div>
        <h3 className="ach-modal-title">{banner.title}</h3>
        <p className="ach-modal-text">{banner.text}</p>
        {who.length > 0 && (
          <div className="ach-modal-avatars">
            {who.map((n) => (
              <ProfileIcon key={n} name={n} size={34} badges={badges[n]} />
            ))}
          </div>
        )}
        <button type="button" className="btn btn-primary ach-modal-close" onClick={onClose}>
          Close
        </button>
        <div className="ach-modal-hint">swipe away, or close</div>
      </div>
    </div>
  )
}
