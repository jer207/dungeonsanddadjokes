import { useState } from 'react'
import ProgressBar from './ProgressBar.jsx'
import ProfileIcon from './ProfileIcon.jsx'
import Achievements from './Achievements.jsx'
import {
  toWeeks,
  shortLabel,
  monthName,
  monthShadeIndex,
  weekdayLabels,
  prettyDate,
} from '../utils/dates.js'

export default function AdminSection({
  config,
  dates,
  results,
  badges,
  banners,
  submissions,
  onSaveRange,
  onPurge,
  busy,
}) {
  const hasRange = !!(config.startDate && config.endDate)
  const [start, setStart] = useState(config.startDate || '')
  const [end, setEnd] = useState(config.endDate || '')
  const weeks = toWeeks(dates)
  const labels = weekdayLabels()

  function handleSave() {
    if (!start || !end) return
    if (end < start) {
      alert('The end date must fall on or after the start date.')
      return
    }
    onSaveRange(start, end)
  }

  function handlePurge() {
    if (
      confirm(
        'Purge the calendar and every player response? This cannot be undone.',
      )
    ) {
      onPurge()
    }
  }

  const anyResponses = results.some((r) => r.yesCount + r.maybeCount > 0)

  return (
    <section className="section section-admin" id="section-admin">
      <div className="section-inner">
        <h2 className="section-heading dm-heading">Dungeon Master's Sanctum</h2>
        <p className="help-text dm-help">Bend the calendar to your will, dark one.</p>

        <div className="dm-controls">
          {!hasRange ? (
            <>
              <p className="help-text">
                Set the window of dates your players will see, then conjure the calendar.
              </p>
              <div className="dm-range">
                <label className="dm-field">
                  <span>Start</span>
                  <input
                    type="date"
                    className="text-input"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </label>
                <label className="dm-field">
                  <span>End</span>
                  <input
                    type="date"
                    className="text-input"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </label>
              </div>
              <button className="btn btn-dm" type="button" onClick={handleSave} disabled={busy}>
                {busy ? 'Conjuring…' : 'Conjure the Calendar'}
              </button>
            </>
          ) : (
            <>
              <p className="help-text">
                Calendar is live from <strong>{prettyDate(config.startDate)}</strong> to{' '}
                <strong>{prettyDate(config.endDate)}</strong>.{' '}
                {submissions.length} player{submissions.length === 1 ? '' : 's'} have answered.
              </p>
              <button className="btn btn-dm btn-purge" type="button" onClick={handlePurge} disabled={busy}>
                {busy ? 'Purging…' : 'Purge'}
              </button>
              <p className="help-text subtle">
                Purge wipes the date range and every player response back to a blank slate.
              </p>
            </>
          )}
        </div>

        {hasRange && (
          <>
            <h3 className="section-subheading dm-heading">The Calendar</h3>
            <div className="calendar calendar-readonly" role="grid">
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
                    const shade = monthShadeIndex(iso)
                    return (
                      <div key={di} className={`cell shade-${shade}`} title={monthName(iso)}>
                        <span className="cell-date">{shortLabel(iso)}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <h3 className="section-subheading dm-heading">Player Responses</h3>
            <Achievements banners={banners} />
            {!anyResponses && <p className="empty-note">No responses yet.</p>}
            {anyResponses && (
              <ol className="results-list">
                {results
                  .filter((r) => r.yesCount + r.maybeCount > 0)
                  .map((r) => (
                    <li key={r.date} className="result-row open">
                      <div className="result-summary static">
                        <div className="result-top">
                          <span className="result-date">{prettyDate(r.date)}</span>
                          <span className="result-count">
                            {r.yesCount} yes{r.maybeCount ? ` · ${r.maybeCount} maybe` : ''}
                          </span>
                        </div>
                        <ProgressBar yes={r.yesCount} maybe={r.maybeCount} no={r.noCount} />
                      </div>
                      <div className="result-detail">
                        {r.yes.length > 0 && (
                          <div className="detail-group">
                            {r.yes.map((n) => (
                              <ProfileIcon key={`ay-${n}`} name={n} size={26} badges={badges[n]} showName />
                            ))}
                          </div>
                        )}
                        {r.maybe.length > 0 && (
                          <div className="detail-group">
                            {r.maybe.map((n) => (
                              <ProfileIcon
                                key={`am-${n}`}
                                name={n}
                                size={26}
                                badges={badges[n]}
                                showName
                                maybe
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
              </ol>
            )}
          </>
        )}
      </div>
    </section>
  )
}
