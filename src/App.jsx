import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import NameSection from './components/NameSection.jsx'
import CalendarSection from './components/CalendarSection.jsx'
import ResultsSection from './components/ResultsSection.jsx'
import AdminSection from './components/AdminSection.jsx'
import Achievements from './components/Achievements.jsx'
import AchievementModal from './components/AchievementModal.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import { getState, submitAvailability, setDateRange, purge } from './api.js'
import { isConfigured } from './config.js'
import { resolveName, isDM, buildAvatarMap } from './utils/players.js'
import { dateRange } from './utils/dates.js'
import { buildResults, buildAchievements } from './utils/scoring.js'
import { getSeen, markSeen } from './utils/seen.js'
import { readSession, saveSession, clearSession } from './utils/session.js'
import { AvatarContext } from './components/AvatarContext.js'

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
  const [dmPending, setDmPending] = useState(false) // typed "dm", now naming self
  const [selections, setSelections] = useState({}) // { iso: 'yes'|'maybe' }
  const [nameDone, setNameDone] = useState(false)
  const [calendarDone, setCalendarDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dmBusy, setDmBusy] = useState(false)
  const [modalQueue, setModalQueue] = useState([]) // achievement modals to pop

  async function refresh() {
    const state = await getState()
    setData(state)
    return state
  }

  useEffect(() => {
    refresh()
      .then((state) => restoreSession(state))
      .catch((e) => {
        const msg = String(e && e.message)
        if (/failed to fetch|networkerror|load failed/i.test(msg)) {
          setError(
            "Couldn't reach the scheduler. If you're the DM: open your Apps Script " +
              'URL directly — if it shows a Google sign-in instead of data, redeploy the ' +
              'Web App with "Who has access: Anyone".',
          )
        } else {
          setError(msg || 'Failed to load')
        }
      })
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
    () => buildAchievements(data.players, data.availability, data.submissions, data.config),
    [data.players, data.availability, data.submissions, data.config],
  )

  // The seen-log is scoped to the current calendar's summon time, so a fresh
  // calendar re-pops achievements on every device.
  const epoch = data.config.summonedAt || null

  // Queue any not-yet-seen achievements for the logged-in player as pop-up
  // modals. Runs on login and after each refresh (e.g. once a submission lands,
  // or when an end-of-round badge resolves). DM-in-Sanctum sees none — personal
  // achievements pop only in player mode.
  useEffect(() => {
    if (!nameDone || dmMode || dmPending || !name) {
      setModalQueue([])
      return
    }
    const seen = getSeen(name, epoch)
    setModalQueue(banners.filter((b) => b.who.includes(name) && !seen.has(b.id)))
  }, [nameDone, dmMode, dmPending, name, banners, epoch])

  function dismissModal() {
    const cur = modalQueue[0]
    if (cur) markSeen(name, cur.id, epoch)
    setModalQueue((q) => q.slice(1))
  }

  // One unique avatar per known name (roster + anyone who has responded).
  const avatarMap = useMemo(() => {
    const names = [
      ...data.players.map((p) => p.name),
      ...data.submissions.map((s) => s.name),
      ...data.availability.map((a) => a.name),
    ]
    return buildAvatarMap(names)
  }, [data.players, data.submissions, data.availability])

  function scrollToSection(id) {
    // Wait for the section to unlock and lay out (and any overlay to clear)
    // before scrolling — a single rAF fires too early on mobile.
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  // Restore a saved login on load so a refresh doesn't dump you at the name
  // prompt. Runs after the first data fetch so player selections can preload.
  function restoreSession(state) {
    const saved = readSession()
    if (!saved || !saved.name) return
    if (saved.dmMode) {
      setDmMode(true)
      setName(saved.name)
      setNameDone(true)
      return
    }
    const canonical = saved.name
    const existing = {}
    for (const a of state.availability) {
      if (a.name === canonical) existing[a.date] = a.status
    }
    setSelections(existing)
    setCalendarDone(state.submissions.some((s) => s.name === canonical))
    setName(canonical)
    setNameDone(true)
  }

  function handleNameSubmit(typed) {
    // Step two of the DM flow: they've typed "dm", this is their real name.
    if (dmPending) {
      const canonical = resolveName(typed, data.players)
      setDmPending(false)
      setDmMode(true)
      setName(canonical) // the DM's own player identity, used when they join
      setNameDone(true)
      saveSession(canonical, true)
      scrollToSection('section-admin')
      // Backfill DMName on an already-live calendar so achievements can tell
      // who the DM is. setDateRange only rewrites Config — it preserves
      // SummonedAt and every player's response, so no data is lost.
      if (
        data.config.startDate &&
        data.config.endDate &&
        data.config.dmName !== canonical
      ) {
        setDateRange(data.config.startDate, data.config.endDate, canonical)
          .then(refresh)
          .catch(() => {})
      }
      return
    }
    // Step one: the "dm" keyword opens DM mode but first asks for a name.
    if (isDM(typed)) {
      setDmPending(true)
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
    saveSession(canonical, false)
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
      // Record which player is the DM so achievements resolve correctly.
      await setDateRange(start, end, name)
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

  // Log out: return to a blank name field.
  function resetToNameEntry() {
    clearSession()
    setDmMode(false)
    setDmPending(false)
    setName('')
    setSelections({})
    setNameDone(false)
    setCalendarDone(false)
    setError(null)
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  // The DM taps "Add my availability" — drop straight into player mode, already
  // logged in under their own name. To return to the Sanctum they log out and
  // type "dm" again.
  function joinAsPlayer() {
    setDmMode(false)
    const canonical = name
    const existing = {}
    for (const a of data.availability) {
      if (a.name === canonical) existing[a.date] = a.status
    }
    setSelections(existing)
    setCalendarDone(data.submissions.some((s) => s.name === canonical))
    setNameDone(true)
    saveSession(canonical, false)
    scrollToSection('section-calendar')
  }

  return (
    <AvatarContext.Provider value={avatarMap}>
    <div className={`app ${dmMode ? 'dm-mode' : ''}`}>
      <Header />

      {nameDone && (
        <div className="identity-bar">
          <span className="identity-label">
            {dmMode ? `Dungeon Master · ${name}` : `Playing as ${name}`}
          </span>
          <button type="button" className="logout-btn" onClick={resetToNameEntry}>
            Log out
          </button>
        </div>
      )}

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
              key={dmPending ? 'dm-name' : 'player-name'}
              players={data.players}
              name={name}
              onSubmit={handleNameSubmit}
              locked={nameDone}
              dmPending={dmPending}
            />
            {!dmPending && (
              <>
                <CalendarSection
                  dates={dates}
                  selections={selections}
                  onToggle={toggleCell}
                  onSubmit={handleCalendarSubmit}
                  disabled={!nameDone}
                  submitting={submitting}
                  submitted={calendarDone}
                />
                {nameDone && (
                  <section className="section section-achievements" id="section-achievements">
                    <div className="section-inner">
                      <h2 className="section-heading">Hall of Fame</h2>
                      <p className="help-text">Deeds and misdeeds, tallied by Lolth herself.</p>
                      <Achievements banners={banners} badges={badges} />
                    </div>
                  </section>
                )}
                <ResultsSection
                  results={results}
                  badges={badges}
                  disabled={!calendarDone}
                />
              </>
            )}
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
            onJoinAsPlayer={joinAsPlayer}
            busy={dmBusy}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>May your rolls be ever in your favour.</span>
      </footer>

      {modalQueue.length > 0 && (
        <AchievementModal banner={modalQueue[0]} badges={badges} onClose={dismissModal} />
      )}

      <LoadingOverlay show={submitting || dmBusy} />
    </div>
    </AvatarContext.Provider>
  )
}
