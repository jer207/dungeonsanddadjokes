import ProfileIcon from './ProfileIcon.jsx'
import { ACHIEVEMENT_CATALOG } from '../utils/scoring.js'

function joinNames(names) {
  if (!names || names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

// The standing "trophy shelf": every achievement earned so far, honors and
// heckles alike, plus an accordion of the ones still locked. The one-time
// unlock is handled separately by AchievementModal.
export default function Achievements({ banners, badges = {} }) {
  const list = banners || []
  const unlocked = new Set(list.map((b) => b.id))
  const locked = ACHIEVEMENT_CATALOG.filter((c) => !unlocked.has(c.id))

  if (list.length === 0 && locked.length === 0) return null

  return (
    <div className="achievement-feed">
      {list.map((b) => {
        const who = b.who || []
        return (
          <div key={b.id} className={`ach-card ach-${b.tone}`}>
            <span className="ach-icon" aria-hidden="true">
              {b.icon}
            </span>
            <div className="ach-body">
              <div className="ach-unlock">
                Achievement unlocked by <span className="ach-who">{joinNames(who)}</span>
              </div>
              <div className="ach-title">{b.title}</div>
              <div className="ach-text">{b.text}</div>
            </div>
            <div className="ach-avatars">
              {who.map((n) => (
                <ProfileIcon key={n} name={n} size={26} badges={badges[n]} />
              ))}
            </div>
          </div>
        )
      })}

      {locked.length > 0 && (
        <details className="locked-ach">
          <summary className="locked-summary">
            Still locked <span className="locked-count">{locked.length}</span>
          </summary>
          <div className="locked-list">
            {locked.map((c) => {
              // Gags stay a mystery until earned; honors show how to earn them.
              const gag = c.tone === 'gag'
              return (
                <div key={c.id} className="ach-card ach-locked">
                  <span className="ach-icon" aria-hidden="true">
                    {gag ? '❔' : c.icon}
                  </span>
                  <div className="ach-body">
                    <div className="ach-title">{gag ? 'Unknown achievement' : c.title}</div>
                    <div className="ach-text">{gag ? c.teaser : c.hint}</div>
                  </div>
                  <span className="locked-lock" aria-hidden="true">
                    🔒
                  </span>
                </div>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}
