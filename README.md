# Dungeons &amp; Dad Jokes — Group Scheduler

A single-page group scheduler for our DnD group. Players enter their name, mark
which days work for them on a running calendar, and everyone sees a ranked list
of the best nights to play. A hidden **Dungeon Master** panel sets the date
range and can wipe everything clean.

Built with **React + Vite**, hosted on **GitHub Pages**, backed by a **Google
Sheet** through a small **Google Apps Script** web app.

- 🟢 **Yes** / 🟡 **Maybe** / ⚪ **No** availability, with yes weighted above maybe.
- 🏆 Achievements: first to submit gets a silver ring, most dates get a gold
  border (both = gold + silver star), plus playful heckles for the slowpoke and
  the person with the fewest dates.
- 🐉 DM mode: darker "evil" theme, date-range control, and a **Purge** button.
- 📱 Mobile-first, works on desktop too.

---

## 1. How it fits together

```
Browser (this site)  ──GET/POST──►  Apps Script Web App  ──►  Google Sheet
   React app                          (Code.gs)                (4 tabs)
```

The site talks to one Apps Script URL. Until you set that URL it runs in
**demo mode** and stores everything in your browser's `localStorage` so you can
try it out.

---

## 2. Set up the Google Sheet

1. Create a new Google Sheet (name it anything, e.g. *DnD Scheduler DB*).
2. Create **four tabs** with these exact names and header rows:

   **`Players`**

   | Name | Variants |
   | ---- | -------- |
   | Jim  | Jim;James;LaMarca;Jim LaMarca;James Lamarca |
   | Aria | Aria;Ari |

   - Column **A** is the canonical display name.
   - Column **B** is a **semicolon-separated** list of alternate spellings.
     Names are matched case-insensitively, so you don't need lowercase variants.
     You don't have to repeat the canonical name in Variants — it's added
     automatically.

   **`Config`**

   | StartDate | EndDate |
   | --------- | ------- |
   | *(blank)* | *(blank)* |

   Leave row 2 blank — the DM fills this from the site.

   **`Availability`**

   | Name | Date | Status |
   | ---- | ---- | ------ |

   Header row only; the script writes the rest.

   **`Submissions`**

   | Name | Timestamp | Order |
   | ---- | --------- | ----- |

   Header row only; the script writes the rest.

> Tip: the tab names are case-sensitive. If a tab is missing the script will
> create it automatically the first time it runs, but it's cleaner to make them
> yourself.

---

## 3. Deploy the Apps Script backend

1. In the Google Sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder `Code.gs` contents and paste in everything from
   [`apps-script/Code.gs`](apps-script/Code.gs) in this repo.
3. (Optional) If the script is bound to the sheet, leave `SHEET_ID = ''`. If you
   run it standalone instead, paste your Sheet's ID (from its URL) into
   `SHEET_ID`.
4. Click **Deploy → New deployment**.
   - **Type:** *Web app*
   - **Description:** anything
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*  ← required so the site can reach it.
5. Click **Deploy**, grant the permissions it asks for, and copy the **Web app
   URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfy................/exec
   ```

> Whenever you change `Code.gs`, use **Deploy → Manage deployments → Edit → New
> version** so the `/exec` URL keeps working. Creating a brand-new deployment
> gives you a new URL you'd have to paste in again.

---

## 4. Connect the site to the backend

1. Open [`src/config.js`](src/config.js).
2. Replace the placeholder with your Web app URL:

   ```js
   export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfy.../exec'
   ```

3. Commit and push to `main`. GitHub Actions rebuilds and redeploys automatically.

That's it — no other keys or secrets are needed. (The Apps Script URL is not a
secret; it only exposes the scheduler data, which the group shares anyway.)

---

## 5. GitHub Pages settings

The repo already includes the deploy workflow at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). You just need to
switch Pages to "GitHub Actions":

1. Go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab and let the *Deploy to GitHub Pages* workflow run.
   The workflow triggers on every push to the repo's **default branch** (and to
   `main`), so it will run automatically on the next push; you can also start it
   manually with **Run workflow**.
4. Your site will be live at:

   ```
   https://jer207.github.io/dungeonsanddadjokes/
   ```

> The workflow deploys from the **default branch**. This repo's default branch
> is currently `claude/dnd-group-scheduler-vkiekw`; if you later create/rename
> the default to `main`, the workflow already covers that too.

> **Important:** the app is configured for the project path
> `/dungeonsanddadjokes/` (see `base` in `vite.config.js`). If you ever rename
> the repo, update that value to match, or the CSS/JS won't load.

---

## 6. Using it

- **Players:** open the site, type your name, tap the days that work
  (tap = yes, tap again = maybe, again = clear), and submit. Then watch the
  ranked results and achievements.
- **The DM:** type `dm` (any casing) as your name. You'll get the Sanctum:
  - No range yet → pick a **start** and **end** date and **Conjure the
    Calendar**.
  - Range already set → a **Purge** button clears the range *and* every player
    response back to a blank slate.

---

## 7. Local development

```bash
npm install
npm run dev      # http://localhost:5173/dungeonsanddadjokes/
npm run build    # production build into dist/
npm run preview  # preview the production build
```

With `APPS_SCRIPT_URL` left as the placeholder, the app runs in demo mode using
`localStorage` (data is per-browser and not shared). Set the URL to use the real
Google Sheet.

---

## Project layout

```
├─ .github/workflows/deploy.yml   GitHub Pages build + deploy
├─ apps-script/Code.gs            Google Apps Script backend (paste into Apps Script)
├─ index.html                     Fonts + root element
├─ vite.config.js                 base path = /dungeonsanddadjokes/
├─ src/
│  ├─ config.js                   ← paste your Apps Script URL here
│  ├─ api.js                      remote + localStorage-demo data layer
│  ├─ App.jsx                     app state + section flow
│  ├─ styles.css                  the whole theme
│  ├─ components/                 Header, Name/Calendar/Results/Admin, avatars…
│  └─ utils/                      dates, scoring/achievements, player matching
└─ README.md
```
