#!/usr/bin/env node
// MBZF push scheduler.
//
// Runs once per invocation (a systemd timer fires it every minute on the VPS).
// It owns the clock: it computes which notifications are due "now" in Miami
// local time and sends them immediately via the OneSignal REST API. No
// reliance on OneSignal's own future-scheduling.
//
// Handles both countdown milestones (200/100/60/30/15/1 days before the
// festival) and class-start alerts (each workshop's start time, shifted by a
// live delay offset). Both share one send/dedupe/catch-up core.
//
// Subcommands:
//   run [--dry-run]   send everything due (default). --dry-run prints, sends nothing.
//   status            print current time, milestones, class delay and state.
//   delay <min>       shift today's not-yet-sent classes by <min> (or +N / -N).
//   reset             clear the class delay now (also auto-resets at 06:00 ET).
//   send "<msg>"      ad-hoc announcement to all subscribers (owner-triggered).

import { DateTime } from 'luxon'
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const CONFIG_DIR = process.env.MBZF_CONFIG_DIR || join(ROOT, 'config')
const STATE_DIR = process.env.MBZF_STATE_DIR || join(ROOT, 'state')
const SENT_LOG = join(STATE_DIR, 'sent.log')
const OFFSET_FILE = join(STATE_DIR, 'offset.json')
const TBD_TITLE = 'Topic T.B.D.'

const APP_ID = process.env.ONESIGNAL_APP_ID || 'e62fa68b-91d7-4b40-aa7d-97ec3bc6de16'
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY || ''
const SEGMENT = process.env.MBZF_SEGMENT || 'Subscribed Users'

// ── helpers ────────────────────────────────────────────────────────────────

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/** "Now" in the given zone. MBZF_NOW (ISO) overrides it for testing/rehearsal. */
function nowInZone(tz) {
  return process.env.MBZF_NOW
    ? DateTime.fromISO(process.env.MBZF_NOW, { zone: tz })
    : DateTime.now().setZone(tz)
}

/** Deterministic UUIDv5 (SHA-1) so an idempotency_key is stable across retries. */
function uuidv5(name, namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8') {
  const nsBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex')
  const hash = createHash('sha1').update(nsBytes).update(name, 'utf8').digest()
  const b = Buffer.from(hash.subarray(0, 16))
  b[6] = (b[6] & 0x0f) | 0x50 // version 5
  b[8] = (b[8] & 0x3f) | 0x80 // variant
  const h = b.toString('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

function readSent() {
  if (!existsSync(SENT_LOG)) return new Set()
  return new Set(
    readFileSync(SENT_LOG, 'utf8')
      .split('\n')
      .map((l) => l.split('\t')[0].trim())
      .filter(Boolean)
  )
}

function recordSent(key, note = '') {
  mkdirSync(STATE_DIR, { recursive: true })
  appendFileSync(SENT_LOG, `${key}\t${DateTime.utc().toISO()}\t${note}\n`)
}

/** Fire moment for a milestone: (target − N days) at sendLocalTime, in tz. */
function fireMomentFor(cfg, days) {
  const [h, m] = cfg.sendLocalTime.split(':').map(Number)
  return DateTime.fromISO(cfg.target, { zone: cfg.timezone })
    .minus({ days })
    .set({ hour: h, minute: m, second: 0, millisecond: 0 })
}

// ── class alerts (Phase 3) ───────────────────────────────────────────────────

/** '1:30' + 'PM' → { hour: 13, minute: 30 }. */
function parseTime(time, ampm) {
  let [hour, minute] = time.split(':').map(Number)
  if (ampm === 'PM' && hour < 12) hour += 12
  if (ampm === 'AM' && hour === 12) hour = 0
  return { hour, minute }
}

/** Human label for a room/main entry: artist name, or a real (non-TBD) title. */
function entryLabel(e) {
  if (!e) return null
  const name = e.artist || (e.title && e.title !== TBD_TITLE ? e.title : null)
  if (!name) return null
  const extra = e.artist && e.title && e.title !== TBD_TITLE ? ` (${e.title})` : ''
  return name + extra
}

/** Push copy for a workshop slot, or null if there is nothing to announce. */
function classMessage(slot) {
  const title = 'On the floor now 🕺'
  if (slot.main) {
    const l = entryLabel(slot.main)
    return l ? { title, body: l } : null
  }
  const parts = []
  const l1 = entryLabel(slot.room1)
  const l2 = entryLabel(slot.room2)
  if (l1) parts.push(`Room 1: ${l1}`)
  if (l2) parts.push(`Room 2: ${l2}`)
  return parts.length ? { title, body: parts.join('  ·  ') } : null
}

/** Fire moment for a workshop slot: festival date + start time (+ delay), in tz. */
function slotFireMoment(sched, slot, tz, offsetMin) {
  const day = sched.days.find((d) => d.n === slot.day)
  const { hour, minute } = parseTime(slot.time, slot.ampm)
  return DateTime.fromObject(
    { year: sched.festival.year, month: sched.festival.month, day: Number(day.date), hour, minute },
    { zone: tz }
  ).plus({ minutes: offsetMin })
}

/** Due / missed workshop alerts relative to `now`, with the current delay applied. */
function evaluateClasses(sched, now, sent, offsetMin, tz) {
  const due = []
  const missed = []
  for (const slot of sched.slots) {
    if (slot.type !== 'workshop') continue // parties / socials / pool are out of scope
    const msg = classMessage(slot)
    if (!msg) continue
    const key = `class:${slot.id}`
    if (sent.has(key)) continue
    const fire = slotFireMoment(sched, slot, tz, offsetMin)
    const item = { key, fire, title: msg.title, body: msg.body }
    if (now < fire) continue // pending, stay silent
    else if (now <= fire.plus({ minutes: 10 })) due.push(item)
    else missed.push(item) // more than 10 min late — never send a stale "now"
  }
  return { due, missed }
}

// ── delay offset (Phase 3) ────────────────────────────────────────────────────

/** The logical festival day, with the boundary at 06:00 (parties run past midnight). */
function logicalDay(now) {
  return now.minus({ hours: 6 }).toISODate()
}

/** Current class delay in minutes; auto-resets to 0 once we cross into a new day. */
function readOffset(now) {
  if (!existsSync(OFFSET_FILE)) return 0
  try {
    const o = JSON.parse(readFileSync(OFFSET_FILE, 'utf8'))
    if (o.day !== logicalDay(now)) return 0 // stale → auto-reset at 6:00 AM boundary
    return Number(o.minutes) || 0
  } catch {
    return 0
  }
}

function writeOffset(now, minutes) {
  mkdirSync(STATE_DIR, { recursive: true })
  writeFileSync(
    OFFSET_FILE,
    JSON.stringify({ minutes, day: logicalDay(now), setAt: DateTime.utc().toISO() }, null, 2) + '\n'
  )
}

// ── OneSignal send ───────────────────────────────────────────────────────────

async function sendPush({ title, body, key }) {
  if (!REST_KEY) throw new Error('ONESIGNAL_REST_API_KEY is not set')
  const res = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Key ${REST_KEY}`,
    },
    body: JSON.stringify({
      app_id: APP_ID,
      target_channel: 'push',
      included_segments: [SEGMENT],
      headings: { en: title },
      contents: { en: body },
      idempotency_key: uuidv5(key),
    }),
  })
  const text = await res.text()
  if (res.status === 429) {
    const retry = res.headers.get('retry-after') || '?'
    throw new Error(`rate limited (retry-after ${retry}s)`)
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`)
  let json = {}
  try {
    json = JSON.parse(text)
  } catch {
    /* non-JSON body */
  }
  // OneSignal returns an empty id when nobody matched the segment.
  if (json.id === '' || json.id == null) {
    throw new Error(`no recipients (segment "${SEGMENT}" empty?): ${text}`)
  }
  return json.id
}

// ── due computation ──────────────────────────────────────────────────────────

/** Returns { due, missed, pending } lists of countdown items relative to `now`. */
function evaluateCountdown(cfg, now, sent) {
  const catchUp = { hours: cfg.catchUpHours ?? 6 }
  const due = []
  const missed = []
  const pending = []
  for (const ms of cfg.milestones) {
    const key = `countdown:${ms.days}`
    const fire = fireMomentFor(cfg, ms.days)
    const deadline = fire.plus(catchUp)
    const item = { key, days: ms.days, fire, title: cfg.title, body: ms.body }
    if (sent.has(key)) continue // already handled
    if (now < fire) pending.push(item)
    else if (now <= deadline) due.push(item)
    else missed.push(item) // overdue past the catch-up window
  }
  return { due, missed, pending }
}

// ── commands ─────────────────────────────────────────────────────────────────

async function cmdRun({ dryRun }) {
  const cfg = loadJSON(join(CONFIG_DIR, 'countdown.json'))
  const tz = cfg.timezone
  const now = nowInZone(tz)
  const sent = readSent()

  const due = []
  const missed = []

  // Countdown milestones.
  const cd = evaluateCountdown(cfg, now, sent)
  due.push(...cd.due)
  missed.push(...cd.missed)

  // Class alerts — only if the schedule has been deployed (Phase 3).
  const schedPath = join(CONFIG_DIR, 'schedule.json')
  if (existsSync(schedPath)) {
    const sched = loadJSON(schedPath)
    const offsetMin = readOffset(now)
    const cl = evaluateClasses(sched, now, sent, offsetMin, tz)
    due.push(...cl.due)
    missed.push(...cl.missed)
  }

  for (const item of missed) {
    // Past the catch-up window — record so we don't keep re-evaluating it,
    // but never send a stale reminder.
    if (!dryRun) recordSent(item.key, 'missed')
    console.log(`[skip] ${item.key} missed (fire ${item.fire.toISO()})`)
  }

  if (due.length === 0) {
    console.log(`[ok] nothing due at ${now.toISO()}`)
    return
  }

  for (const item of due) {
    if (dryRun) {
      console.log(`[dry] WOULD SEND ${item.key}: "${item.title}" — ${item.body}`)
      continue
    }
    try {
      const id = await sendPush(item)
      recordSent(item.key, `sent ${id}`)
      console.log(`[sent] ${item.key} → ${id}`)
    } catch (err) {
      // Do NOT record — the next tick retries within the catch-up window.
      console.error(`[error] ${item.key}: ${err.message}`)
      process.exitCode = 1
    }
  }
}

function cmdDelay(arg) {
  const cfg = loadJSON(join(CONFIG_DIR, 'countdown.json'))
  const now = nowInZone(cfg.timezone)
  if (arg == null) {
    console.error('usage: mbzf-notify delay <minutes> | +<min> | -<min>')
    process.exit(2)
  }
  const cur = readOffset(now)
  const next = /^[+-]/.test(arg) ? cur + parseInt(arg, 10) : parseInt(arg, 10)
  if (Number.isNaN(next)) {
    console.error(`invalid minutes: ${arg}`)
    process.exit(2)
  }
  writeOffset(now, next)
  console.log(
    `[delay] classes now shifted ${next >= 0 ? '+' : ''}${next} min for today (was ${cur}). ` +
      `Auto-resets at 06:00 ${cfg.timezone}; "reset" clears it now.`
  )
}

function cmdReset() {
  const cfg = loadJSON(join(CONFIG_DIR, 'countdown.json'))
  const now = nowInZone(cfg.timezone)
  writeOffset(now, 0)
  console.log('[reset] class delay back to 0.')
}

/**
 * Ad-hoc announcement to all subscribers. Owner-triggered (via Hermes), which
 * always confirms the text first. Not deduped — each call is a fresh send.
 *   send "<message>"            → title defaults to config.title
 *   send "<title>" "<body>"     → explicit title + body
 *   send --dry-run "<message>"  → print only, no send
 */
async function cmdSend(args) {
  const dry = args.includes('--dry-run')
  const rest = args.filter((a) => a !== '--dry-run')
  const cfg = loadJSON(join(CONFIG_DIR, 'countdown.json'))
  let title, body
  if (rest.length >= 2) {
    title = rest[0]
    body = rest.slice(1).join(' ')
  } else if (rest.length === 1) {
    title = cfg.title
    body = rest[0]
  } else {
    console.error('usage: mbzf-notify send [--dry-run] "<message>" | "<title>" "<body>"')
    process.exit(2)
  }
  if (dry) {
    console.log(`[dry] WOULD SEND announcement: "${title}" — ${body}`)
    return
  }
  const id = await sendPush({ title, body, key: `announce:${Date.now()}` })
  console.log(`[sent] announcement "${title}" → ${id}`)
}

function cmdStatus() {
  const cfg = loadJSON(join(CONFIG_DIR, 'countdown.json'))
  const now = nowInZone(cfg.timezone)
  const sent = readSent()
  console.log(`now:    ${now.toFormat('yyyy-MM-dd HH:mm ZZZZ')}  (${now.toISO()})`)
  console.log(`target: ${cfg.target}  tz ${cfg.timezone}  send ${cfg.sendLocalTime}  catch-up ${cfg.catchUpHours}h`)
  console.log('countdown milestones:')
  const { due } = evaluateCountdown(cfg, now, sent)
  const dueKeys = new Set(due.map((d) => d.key))
  for (const ms of cfg.milestones) {
    const key = `countdown:${ms.days}`
    const fire = fireMomentFor(cfg, ms.days)
    let state
    if (sent.has(key)) state = 'sent/handled'
    else if (dueKeys.has(key)) state = 'DUE NOW'
    else if (now < fire) state = `pending (${Math.round(fire.diff(now, 'days').days)}d)`
    else state = 'missed'
    console.log(
      `  ${String(ms.days).padStart(3)}d  fire ${fire.toFormat('yyyy-MM-dd HH:mm ZZZZ')}  ${fire.toUTC().toISO()}  [${state}]`
    )
  }
  // Classes + current delay.
  const schedPath = join(CONFIG_DIR, 'schedule.json')
  if (existsSync(schedPath)) {
    const sched = loadJSON(schedPath)
    const offsetMin = readOffset(now)
    const workshops = sched.slots.filter((s) => s.type === 'workshop').length
    const { due } = evaluateClasses(sched, now, sent, offsetMin, cfg.timezone)
    console.log(
      `classes: ${workshops} workshops · delay ${offsetMin >= 0 ? '+' : ''}${offsetMin} min ` +
        `(logical day ${logicalDay(now)}) · ${due.length} due now`
    )
  } else {
    console.log('classes: schedule.json not deployed (class alerts inactive)')
  }

  if (existsSync(STATE_DIR)) {
    const files = readdirSync(STATE_DIR)
    console.log(`state dir: ${STATE_DIR} (${files.join(', ') || 'empty'})`)
  } else {
    console.log(`state dir: ${STATE_DIR} (not created yet)`)
  }
}

// ── entry ──────────────────────────────────────────────────────────────────

const cmd = process.argv[2] || 'run'
const dryRun = process.argv.includes('--dry-run')

try {
  if (cmd === 'run') await cmdRun({ dryRun })
  else if (cmd === 'status') cmdStatus()
  else if (cmd === 'delay') cmdDelay(process.argv[3])
  else if (cmd === 'reset') cmdReset()
  else if (cmd === 'send') await cmdSend(process.argv.slice(3))
  else {
    console.error(
      `unknown command: ${cmd}\n` +
        'usage: mbzf-notify [run [--dry-run] | status | delay <min> | reset | send "<msg>"]'
    )
    process.exit(2)
  }
} catch (err) {
  console.error(`[fatal] ${err.message}`)
  process.exit(1)
}
