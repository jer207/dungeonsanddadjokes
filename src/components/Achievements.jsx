import ProfileIcon from './ProfileIcon.jsx'

function joinNames(names) {
  if (!names || names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

// The standing "trophy shelf": every achievement earned so far, honors and
// heckles alike. The one-time unlock is handled separately by AchievementModal.
export default function Achievements({ banners, badges = {} }) {
  if (!banners || banners.length === 0) return null
  return (
    <div className="achievement-feed">
      {banners.map((b) => {
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
    </div>
  )
}
