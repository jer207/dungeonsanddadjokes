// A small transient notice that fades in at the bottom of the screen. Stays
// mounted so it can fade both ways; `show` toggles its visibility.
export default function Toast({ show, message }) {
  return (
    <div className={`toast ${show ? 'show' : ''}`} role="status" aria-hidden={!show}>
      {message}
    </div>
  )
}
