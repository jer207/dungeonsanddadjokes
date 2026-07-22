// ---------------------------------------------------------------------------
//  CONFIGURATION
// ---------------------------------------------------------------------------
//  Paste the Google Apps Script Web App URL below (see README.md → "Backend
//  setup"). It looks like:
//
//      https://script.google.com/macros/s/AKfy................/exec
//
//  Until you paste a real URL here, the app runs in DEMO MODE and stores all
//  data in your browser's localStorage so you can try it out. Demo data is not
//  shared between people or devices.
// ---------------------------------------------------------------------------

export const APPS_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE'

// The name(s) that unlock the Dungeon Master control panel. Not case sensitive.
export const DM_NAMES = ['dm']

export const isConfigured = () =>
  typeof APPS_SCRIPT_URL === 'string' &&
  APPS_SCRIPT_URL.startsWith('https://script.google.com/')
