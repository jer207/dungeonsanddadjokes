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

export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUgNwI6LnrIFBI67x1gEP6NOteROE_Tp0_q0r7rTP-biSTQZ9ptlMFQTQTtd4pL_MlVQ/exec'

// The name(s) that unlock the Dungeon Master control panel. Not case sensitive.
export const DM_NAMES = ['dm']

// Public URL of the deployed site, used by the DM's "share with the party"
// button.
export const SHARE_URL = 'https://jer207.github.io/dungeonsanddadjokes/'

// The message the share button copies to the clipboard.
export const SHARE_MESSAGE =
  'The calendar has been conjured. Players are summoned. Travel to this link ' +
  'and share your availability with the group.\n\n' +
  SHARE_URL +
  '\n\nThe world is counting on you …'

export const isConfigured = () =>
  typeof APPS_SCRIPT_URL === 'string' &&
  APPS_SCRIPT_URL.startsWith('https://script.google.com/')
