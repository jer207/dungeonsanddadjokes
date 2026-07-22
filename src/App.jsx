import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import NameSection from './components/NameSection.jsx'
import CalendarSection from './components/CalendarSection.jsx'
import ResultsSection from './components/ResultsSection.jsx'
import AdminSection from './components/AdminSection.jsx'
import { getState, submitAvailability, setDateRange, purge } from './api.js'
import { isConfigured } from './config.js'
import { resolveName, isDM } from './utils/players.js'
import { dateRange } from './utils/dates.js'
import { buildResults, buildAchievements } from './utils/scoring.js'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    players: [],
    config: { startDate: null, endDate: null },
    availability: [],
    submissions: [],
  })

  const [name, setName] = useState('') // canonical name once submitted
  const [dmMode, setDmMode] = useState(false)
  const [selections, setSelections] = useState({}) // { iso: 'yes'|'maybe' }
  const [nameDone, setNameDone] = useState(false)
  const [calendarDone, setCalendarDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dmBusy, setDmBusy] = useState(false)

  async function refresh() {
    const state = await getState()
    setData(state)
    return state
  }

  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const dates = useMemo(
    () => dateRange(data.config.startDate, data.config.endDate),
    [data.config.startDate, data.config.endDate],
  )

  const results = useMemo(
    () => buildResults(dates, data.availability, data.submissions),
    [dates, data.availability, data.submissions],
  )

  const { badges, banners } = useMemo(
    () => buildAchievements(data.players, data.availability, data.submissions),
    [data.players, data.availability, data.submissions],
  )

  function scrollToSection(id) {
    // let the DOM settle first
    requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function handleNameSubmit(typed) {
    if (isDM(typed)) {
      setDmMode(true)
      setName('DM')
      setNameDone(true)
      scrollToSection('section-admin')
      return
    }
    setDmMode(false)
    const canonical = resolveName(typed, data.players)
    setName(canonical)
    // preload any existing selections for this player
    const existing = {}
    for (const a of data.availability) {
      if (a.name === canonical) existing[a.date] = a.status
    }
    setSelections(existing)
    setCalendarDone(data.submissions.some((s) => s.name === canonical))
    setNameDone(true)
    scrollToSection('section-calendar')
  }

  function toggleCell(iso) {
    setSelections((prev) => {
      const next = { ...prev }
      const cur = next[iso]
      if (!cur) next[iso] = 'yes'
      else if (cur === 'yes') next[iso] = 'maybe'
      else delete next[iso]
      return next
    })
  }

  async function handleCalendarSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const sel = Object.entries(selections).map(([date, status]) => ({ date, status }))
      await submitAvailability(name, sel)
      await refresh()
      setCalendarDone(true)
      scrollToSection('section-results')
    } catch (e) {
      setError(e.message || 'Could not submit. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveRange(start, end) {
    setDmBusy(true)
    setError(null)
    try {
      await setDateRange(start, end)
      await refresh()
    } catch (e) {
      setError(e.message || 'Could not save the range.')
    } finally {
      setDmBusy(false)
    }
  }

  async function handlePurge() {
    setDmBusy(true)
    setError(null)
    try {
      await purge()
      await refresh()
    } catch (e) {
      setError(e.message || 'Could not purge.')
    } finally {
      setDmBusy(false)
    }
  }

  const totalPlayers = data.players.length

  return (
    <div className={`app ${dmMode ? 'dm-mode' : ''}`}>
      <Header />

      {!isConfigured() && (
        <div className="demo-banner">
          Demo mode — data is saved only in this browser. See{' '}
          <code>src/config.js</code> to connect the Google Sheet.
        </div>
      )}

      <main className="app-main">
        {loading && <p className="loading">Unrolling the scrolls…</p>}
        {error && <p className="error-banner">{error}</p>}

        {!loading && !dmMode && (
          <>
            <NameSection
              players={data.players}
              name={name}
              onSubmit={handleNameSubmit}
              locked={nameDone}
            />
            <CalendarSection
              dates={dates}
              selections={selections}
              onToggle={toggleCell}
              onSubmit={handleCalendarSubmit}
              disabled={!nameDone}
              submitting={submitting}
              submitted={calendarDone}
            />
            <ResultsSection
              results={results}
              badges={badges}
              banners={banners}
              disabled={!calendarDone}
              totalPlayers={totalPlayers}
            />
          </>
        )}

        {!loading && dmMode && (
          <AdminSection
            config={data.config}
            dates={dates}
            results={results}
            badges={badges}
            banners={banners}
            submissions={data.submissions}
            onSaveRange={handleSaveRange}
            onPurge={handlePurge}
            busy={dmBusy}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>May your rolls be ever in your favour.</span>
      </footer>
    </div>
  )
}
