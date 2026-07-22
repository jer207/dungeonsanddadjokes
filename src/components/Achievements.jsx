const ICONS = {
  silver: '🥈',
  gold: '🏆',
  snail: '🐌',
  scroll: '📜',
}

export default function Achievements({ banners }) {
  if (!banners || banners.length === 0) return null
  return (
    <div className="achievements">
      <h3 className="achievements-title">Tavern Boasts &amp; Heckles</h3>
      <div className="achievement-list">
        {banners.map((b, i) => (
          <div key={i} className={`achievement achievement-${b.icon}`}>
            <span className="achievement-icon" aria-hidden="true">
              {ICONS[b.icon] || '⭐'}
            </span>
            <div>
              <div className="achievement-name">{b.title}</div>
              <div className="achievement-text">{b.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
