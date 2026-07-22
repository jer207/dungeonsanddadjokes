import { avatarFor } from '../utils/players.js'

// Minimalist fantasy glyphs drawn on a 24x24 viewBox, centred.
const GLYPH_PATHS = {
  shield: <path d="M12 3l6 2v6c0 4-2.6 6.6-6 8.5C8.6 17.6 6 15 6 11V5z" fill="#fff" opacity="0.92" />,
  sword: (
    <g fill="#fff" opacity="0.92">
      <path d="M12 3l2 2-5.5 5.5L7 9z" />
      <path d="M6.5 11.5l2 2L6 16l-1.5-.5L4 14z" />
      <rect x="11.2" y="14.5" width="1.6" height="5" rx="0.6" />
      <rect x="9.5" y="16.4" width="5" height="1.4" rx="0.6" />
    </g>
  ),
  axe: (
    <g fill="#fff" opacity="0.92">
      <rect x="11.3" y="4" width="1.4" height="16" rx="0.6" />
      <path d="M12.5 5c3 0 5.5 1.6 6 4.2-2.4-1-4.2-.8-6-.2z" />
    </g>
  ),
  bow: (
    <g fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.92" strokeLinecap="round">
      <path d="M8 4c5 2 5 14 0 16" />
      <path d="M8 4l9 8-9 4" strokeWidth="1.2" />
    </g>
  ),
  staff: (
    <g fill="#fff" opacity="0.92">
      <rect x="11.3" y="6" width="1.4" height="14" rx="0.6" />
      <circle cx="12" cy="5" r="2.6" />
    </g>
  ),
  potion: (
    <g fill="#fff" opacity="0.92">
      <rect x="10.5" y="3.5" width="3" height="3" rx="0.6" />
      <path d="M10 6.5h4l1.5 8a3.5 3.5 0 01-7 0z" />
    </g>
  ),
  helm: (
    <g fill="#fff" opacity="0.92">
      <path d="M6 11a6 6 0 0112 0v3h-5v-3h-2v3H6z" />
      <rect x="11.2" y="14" width="1.6" height="4" />
    </g>
  ),
  dagger: (
    <g fill="#fff" opacity="0.92">
      <path d="M12 3l1.4 10h-2.8z" />
      <rect x="8.5" y="13" width="7" height="1.4" rx="0.6" />
      <rect x="11.2" y="14.4" width="1.6" height="5" rx="0.6" />
    </g>
  ),
}

/**
 * size    : pixel diameter
 * badges  : { silverRing, goldBorder, star }
 * showName: render the player's name beside the icon (expanded rows)
 * maybe   : append a [maybe] tag after the name
 */
export default function ProfileIcon({ name, size = 20, badges = {}, showName = false, maybe = false }) {
  const { color, glyph } = avatarFor(name)
  const ringWidth = Math.max(2, Math.round(size * 0.12))

  let borderColor = 'transparent'
  if (badges.goldBorder) borderColor = '#ffcf40'
  else if (badges.silverRing) borderColor = '#cfd2da'

  const circle = (
    <span
      className="avatar"
      title={name}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, ${color}, ${shade(color)})`,
        border: borderColor === 'transparent' ? 'none' : `${ringWidth}px solid ${borderColor}`,
        boxShadow: badges.goldBorder
          ? `0 0 8px rgba(255,207,64,0.6)`
          : badges.silverRing
          ? `0 0 6px rgba(207,210,218,0.5)`
          : 'none',
      }}
    >
      <svg viewBox="0 0 24 24" width="70%" height="70%" aria-hidden="true">
        {GLYPH_PATHS[glyph] || GLYPH_PATHS.shield}
      </svg>
      {badges.star && (
        <span className="avatar-star" style={{ fontSize: Math.max(9, size * 0.42) }} aria-hidden="true">
          ★
        </span>
      )}
    </span>
  )

  if (!showName) return circle

  return (
    <span className="avatar-row-item">
      {circle}
      <span className="avatar-name">
        {name}
        {maybe && <span className="maybe-tag"> [maybe]</span>}
      </span>
    </span>
  )
}

// Darken a hex colour for the radial gradient's far edge.
function shade(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 255) - 70)
  const g = Math.max(0, ((n >> 8) & 255) - 70)
  const b = Math.max(0, (n & 255) - 70)
  return `rgb(${r},${g},${b})`
}
