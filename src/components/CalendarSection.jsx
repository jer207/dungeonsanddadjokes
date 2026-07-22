import {
  toWeeks,
  shortLabel,
  monthName,
  monthShadeIndex,
  weekdayLabels,
} from '../utils/dates.js'

// status cycle for a cell: undefined -> 'yes' -> 'maybe' -> undefined
export default function CalendarSection({
  dates,
  selections,
  onToggle,
  onSubmit,
  disabled,
  submitting,
  submitted,
}) {
  const weeks = toWeeks(dates)
  const labels = weekdayLabels()
  const hasRange = dates.length > 0

  return (
    <section
      className={`section section-calendar ${disabled ? 'section-locked' : ''}`}
      id="section-calendar"
      aria-disabled={disabled}
    >
      <div className="section-inner">
        <h2 className="section-heading">When can you play?</h2>
        <p className="help-text">
          Tap a day once for <span className="chip chip-yes">yes</span>, twice for{' '}
          <span className="chip chip-maybe">maybe</span>, a third time to clear it. Days you
          leave untouched count as <span className="chip chip-no">no</span>.
        </p>

        {!hasRange && (
          <p className="empty-note">
            The Dungeon Master hasn't set the dates yet. Check back once the calendar is
            summoned.
          </p>
        )}

        {hasRange && (
          <>
            <div className="calendar" role="grid">
              <div className="calendar-head" role="row">
                {labels.map((l) => (
                  <div key={l} className="calendar-weekday" role="columnheader">
                    {l}
                  </div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="calendar-week" role="row">
                  {week.map((iso, di) => {
                    if (!iso) return <div key={di} className="cell cell-empty" />
                    const status = selections[iso]
                    const shade = monthShadeIndex(iso)
                    return (
                      <button
                        key={di}
                        type="button"
                        className={`cell shade-${shade} ${status ? `cell-${status}` : ''}`}
                        onClick={() => !disabled && onToggle(iso)}
                        disabled={disabled}
                        aria-pressed={!!status}
                        aria-label={`${monthName(iso)} ${shortLabel(iso).split('/')[1]} — ${
                          status || 'no'
                        }`}
                      >
                        <span className="cell-date">{shortLabel(iso)}</span>
                        {status === 'yes' && <span className="cell-mark">✓</span>}
                        {status === 'maybe' && <span className="cell-mark">?</span>}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-submit"
              type="button"
              onClick={onSubmit}
              disabled={disabled || submitting}
            >
              {submitting ? 'Sending raven…' : submitted ? 'Update my availability' : 'Submit my availability'}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
