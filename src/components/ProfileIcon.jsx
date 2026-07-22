import { useContext } from 'react'
import { AvatarContext } from './AvatarContext.js'
import { avatarFor } from '../utils/players.js'
import { ICONS } from '../utils/icons.js'

/**
 * size    : pixel diameter
 * badges  : { silverRing, goldBorder, star }
 * showName: render the player's name beside the icon (expanded rows)
 * maybe   : append a [maybe] tag after the name
 */
export default function ProfileIcon({ name, size = 20, badges = {}, showName = false, maybe = false }) {
  const map = useContext(AvatarContext)
  const { color, icon } = map[name] || avatarFor(name)
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
      <span
        className="avatar-glyph"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: ICONS[icon] || '' }}
      />
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
