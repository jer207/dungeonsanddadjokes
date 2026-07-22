/**
 * Dungeons & Dad Jokes — Group Scheduler backend
 * -----------------------------------------------
 * A Google Apps Script web app that reads/writes a single Google Sheet with
 * four tabs. Deploy it as a Web App (Execute as: Me, Who has access: Anyone)
 * and paste the /exec URL into src/config.js of the site.
 *
 * SHEET TABS (create these tab names exactly, case-sensitive):
 *
 *   Players        A: Name        B: Variants (semicolon-separated)
 *                  e.g.  Jim | Jim;James;LaMarca;Jim LaMarca;James Lamarca
 *
 *   Config         A: StartDate   B: EndDate   C: DMName   D: SummonedAt
 *                  (row 2; DMName marks which player is the DM, SummonedAt is
 *                   an ISO timestamp stamped once when the calendar is conjured)
 *
 *   Availability   A: Name        B: Date        C: Status  (yes|maybe)
 *
 *   Submissions    A: Name        B: Timestamp   C: Order
 *
 * The first row of every tab is a header row.
 */

var SHEET_ID = ''; // <-- OPTIONAL: paste your Sheet ID, or leave blank to use
                   //     the sheet this script is bound to (Extensions > Apps Script).

function ss_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (name === 'Players') sh.appendRow(['Name', 'Variants']);
    if (name === 'Config') sh.appendRow(['StartDate', 'EndDate', 'DMName', 'SummonedAt']);
    if (name === 'Availability') sh.appendRow(['Name', 'Date', 'Status']);
    if (name === 'Submissions') sh.appendRow(['Name', 'Timestamp', 'Order']);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** Normalise anything (Date or string) into a YYYY-MM-DD string. */
function toDateStr_(v) {
  if (v === '' || v === null || v === undefined) return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v).trim();
}

/* ------------------------------------------------------------------ read -- */
function doGet() {
  return json_(readAll_());
}

function readAll_() {
  var players = [];
  var pVals = sheet_('Players').getDataRange().getValues();
  for (var i = 1; i < pVals.length; i++) {
    var name = String(pVals[i][0] || '').trim();
    if (!name) continue;
    var variantsRaw = String(pVals[i][1] || '').trim();
    var variants = variantsRaw
      ? variantsRaw.split(';').map(function (s) { return s.trim(); }).filter(String)
      : [];
    if (variants.indexOf(name) === -1) variants.unshift(name);
    players.push({ name: name, variants: variants });
  }

  var config = { startDate: null, endDate: null, dmName: null, summonedAt: null };
  var cVals = sheet_('Config').getDataRange().getValues();
  if (cVals.length > 1) {
    config.startDate = toDateStr_(cVals[1][0]) || null;
    config.endDate = toDateStr_(cVals[1][1]) || null;
    config.dmName = String(cVals[1][2] || '').trim() || null;
    // SummonedAt is a full timestamp; let JSON serialise a Date to ISO.
    config.summonedAt = cVals[1][3] !== '' && cVals[1][3] !== null ? cVals[1][3] : null;
  }

  var availability = [];
  var aVals = sheet_('Availability').getDataRange().getValues();
  for (var j = 1; j < aVals.length; j++) {
    var an = String(aVals[j][0] || '').trim();
    if (!an) continue;
    availability.push({
      name: an,
      date: toDateStr_(aVals[j][1]),
      status: String(aVals[j][2] || '').trim().toLowerCase(),
    });
  }

  var submissions = [];
  var sVals = sheet_('Submissions').getDataRange().getValues();
  for (var k = 1; k < sVals.length; k++) {
    var sn = String(sVals[k][0] || '').trim();
    if (!sn) continue;
    submissions.push({
      name: sn,
      timestamp: sVals[k][1],
      order: Number(sVals[k][2]) || k,
    });
  }

  return {
    players: players,
    config: config,
    availability: availability,
    submissions: submissions,
  };
}

/* ----------------------------------------------------------------- write -- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var action = body.action;

    if (action === 'submit') return json_(handleSubmit_(body));
    if (action === 'setRange') return json_(handleSetRange_(body));
    if (action === 'purge') return json_(handlePurge_());

    return json_({ error: 'Unknown action: ' + action });
  } catch (err) {
    return json_({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function handleSubmit_(body) {
  var name = String(body.name || '').trim();
  if (!name) return { error: 'Missing name' };
  var selections = body.selections || [];

  // Replace this player's rows in Availability.
  var av = sheet_('Availability');
  var vals = av.getDataRange().getValues();
  var keep = [vals[0]]; // header
  for (var i = 1; i < vals.length; i++) {
    if (String(vals[i][0] || '').trim() !== name) keep.push(vals[i]);
  }
  for (var s = 0; s < selections.length; s++) {
    var sel = selections[s];
    var status = String(sel.status || '').toLowerCase();
    if (status !== 'yes' && status !== 'maybe') continue;
    keep.push([name, toDateStr_(sel.date), status]);
  }
  av.clearContents();
  if (keep.length) {
    av.getRange(1, 1, keep.length, 3).setValues(padRows_(keep, 3));
  }

  // Record submission order the first time we see this player.
  var sub = sheet_('Submissions');
  var sVals = sub.getDataRange().getValues();
  var existing = -1;
  var maxOrder = 0;
  for (var r = 1; r < sVals.length; r++) {
    var rn = String(sVals[r][0] || '').trim();
    if (rn === name) existing = r;
    var ord = Number(sVals[r][2]) || 0;
    if (ord > maxOrder) maxOrder = ord;
  }
  var now = new Date();
  if (existing === -1) {
    sub.appendRow([name, now, maxOrder + 1]);
  } else {
    sub.getRange(existing + 1, 2).setValue(now); // refresh timestamp, keep order
  }

  return { ok: true };
}

function handleSetRange_(body) {
  var start = toDateStr_(body.startDate);
  var end = toDateStr_(body.endDate);
  if (!start || !end) return { error: 'Missing start or end date' };

  var cfg = sheet_('Config');
  var cur = cfg.getDataRange().getValues();

  // Preserve an existing SummonedAt (stamped once, on first conjure) and DMName.
  var summonedAt = (cur.length > 1 && cur[1][3] !== '' && cur[1][3] !== null)
    ? cur[1][3]
    : new Date();
  var dmName = String(body.dmName || '').trim()
    || (cur.length > 1 ? String(cur[1][2] || '').trim() : '');

  cfg.clearContents();
  cfg.getRange(1, 1, 2, 4).setValues([
    ['StartDate', 'EndDate', 'DMName', 'SummonedAt'],
    [start, end, dmName, summonedAt],
  ]);
  return { ok: true };
}

function handlePurge_() {
  var cfg = sheet_('Config');
  cfg.clearContents();
  cfg.getRange(1, 1, 1, 4).setValues([['StartDate', 'EndDate', 'DMName', 'SummonedAt']]);

  var av = sheet_('Availability');
  av.clearContents();
  av.getRange(1, 1, 1, 3).setValues([['Name', 'Date', 'Status']]);

  var sub = sheet_('Submissions');
  sub.clearContents();
  sub.getRange(1, 1, 1, 3).setValues([['Name', 'Timestamp', 'Order']]);

  return { ok: true };
}

function padRows_(rows, cols) {
  return rows.map(function (row) {
    var r = row.slice(0, cols);
    while (r.length < cols) r.push('');
    return r;
  });
}
