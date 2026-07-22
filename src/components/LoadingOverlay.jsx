import sword from '../../assets/spinning-sword.svg?raw'

// Strip the opaque black backdrop and fixed sizing from the committed SVG, and
// recolour it to currentColor so CSS drives the tint (and the spin).
const SWORD = sword
  .replace(/<path\b[^>]*d="M0 0h512v512H0z"[^>]*>\s*<\/path>/i, '')
  .replace(/<path\b[^>]*d="M0 0h512v512H0z"[^>]*\/>/i, '')
  .replace(/(<svg\b[^>]*?)\s+style="[^"]*"/i, '$1')
  .replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i, '$1')
  .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, '$1')
  .replace(/fill="#fff"/gi, 'fill="currentColor"')
  .replace(/fill="#ffffff"/gi, 'fill="currentColor"')

// A full-screen translucent veil shown while a request is in flight. Stays
// mounted so it can fade out; `show` toggles its visibility.
export default function LoadingOverlay({ show, text = 'Sending raven…' }) {
  return (
    <div className={`loading-overlay ${show ? 'show' : ''}`} aria-hidden={!show}>
      <div className="loading-sword" dangerouslySetInnerHTML={{ __html: SWORD }} />
      <p className="loading-text">{text}</p>
    </div>
  )
}
