import { useState } from 'react'
import ProgressBar from './ProgressBar.jsx'
import ProfileIcon from './ProfileIcon.jsx'
import { prettyDate } from '../utils/dates.js'

export default function ResultsSection({ results, badges, disabled }) {
  const [expanded, setExpanded] = useState(null)

  const anyResponses = results.some((r) => r.yesCount + r.maybeCount > 0)

  return (
    <section
      className={`section section-results ${disabled ? 'section-locked' : ''}`}
      id="section-results"
      aria-disabled={disabled}
    >
      <div className="section-inner">
        <h2 className="section-heading">The verdict</h2>
        <p className="help-text">
          Best nights float to the top. Tap a date to see who's in.
        </p>

        {!anyResponses && (
          <p className="empty-note">No votes counted yet. Be the first to answer the call!</p>
        )}

        {anyResponses && (
          <ol className="results-list">
            {results
              .filter((r) => r.yesCount + r.maybeCount > 0)
              .map((r) => {
                const open = expanded === r.date
                return (
                  <li key={r.date} className={`result-row ${open ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="result-summary"
                      onClick={() => setExpanded(open ? null : r.date)}
                      aria-expanded={open}
                    >
                      <div className="result-top">
                        <span className="result-date">{prettyDate(r.date)}</span>
                        <span className="result-count">
                          {r.yesCount} yes{r.maybeCount ? ` · ${r.maybeCount} maybe` : ''}
                        </span>
                      </div>
                      <ProgressBar yes={r.yesCount} maybe={r.maybeCount} no={r.noCount} />
                      <div className="result-avatars">
                        {r.yes.map((n) => (
                          <ProfileIcon key={`y-${n}`} name={n} size={16} badges={badges[n]} />
                        ))}
                        {r.maybe.map((n) => (
                          <ProfileIcon key={`m-${n}`} name={n} size={16} badges={badges[n]} />
                        ))}
                      </div>
                    </button>

                    {open && (
                      <div className="result-detail">
                        {r.yes.length > 0 && (
                          <div className="detail-group">
                            {r.yes.map((n) => (
                              <ProfileIcon
                                key={`dy-${n}`}
                                name={n}
                                size={30}
                                badges={badges[n]}
                                showName
                              />
                            ))}
                          </div>
                        )}
                        {r.maybe.length > 0 && (
                          <div className="detail-group">
                            {r.maybe.map((n) => (
                              <ProfileIcon
                                key={`dm-${n}`}
                                name={n}
                                size={30}
                                badges={badges[n]}
                                showName
                                maybe
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
          </ol>
        )}
      </div>
    </section>
  )
}
