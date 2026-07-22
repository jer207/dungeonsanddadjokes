// A three-part availability bar: green (yes) / yellow (maybe) / grey (no).
export default function ProgressBar({ yes, maybe, no }) {
  const total = Math.max(1, yes + maybe + no)
  const pct = (n) => (n / total) * 100
  return (
    <div className="progress" role="img" aria-label={`${yes} yes, ${maybe} maybe, ${no} no`}>
      {yes > 0 && <span className="seg seg-yes" style={{ width: `${pct(yes)}%` }} />}
      {maybe > 0 && <span className="seg seg-maybe" style={{ width: `${pct(maybe)}%` }} />}
      {no > 0 && <span className="seg seg-no" style={{ width: `${pct(no)}%` }} />}
    </div>
  )
}
