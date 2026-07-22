import ProfileIcon from './ProfileIcon.jsx'

const ICONS = {
  silver: '🥈',
  gold: '🏆',
  snail: '🐌',
  scroll: '📜',
}

function joinNames(names) {
  if (!names || names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

export default function Achievements({ banners, badges = {} }) {
  if (!banners || banners.length === 0) return null
  return (
    <div className="achievement-feed">
      {banners.map((b, i) => {
        const who = b.who || []
        return (
          <div key={i} className={`ach-card ach-${b.icon}`}>
            <span className="ach-icon" aria-hidden="true">
              {ICONS[b.icon] || '⭐'}
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
