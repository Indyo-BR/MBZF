#!/usr/bin/env node
// MBZF push scheduler.
//
// Runs once per invocation (a systemd timer fires it every minute on the VPS).
// It owns the clock: it computes which notifications are due "now" in Miami
// local time and sends them immediately via the OneSignal REST API. No
// reliance on OneSignal's own future-scheduling.
//
// Phase 2 handles the countdown milestones (200/100/60/30/15/1 days before the
// festival). The dedupe/catch-up/send core is shared with Phase 3 (class
// alerts), which will plug in later.
//
// Subcommands:
//   run [--dry-run]   send everything due (default). --dry-run prints, sends nothing.
//   status            print current time + each milestone's fire moment and state.

import { DateTime } from 'luxon'
import { readFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')
const CONFIG_DIR = process.env.MBZF_CONFIG_DIR || join(ROOT, 'config')
const STATE_DIR = process.env.MBZF_STATE_DIR || join(ROOT, 'state')
const SENT_LOG = join(STATE_DIR, 'sent.log')

const APP_ID = process.env.ONESIGNAL_APP_ID || 'e62fa68b-91d7-4b40-aa7d-97ec3bc6de16'
const REST_KEY = process.env.ONESIGNAL_REST_API_KEY || ''
const SEGMENT = process.env.MBZF_SEGMENT || 'Subscribed Users'

// ── helpers ────────────────────────────────────────────────────────────────

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
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

// ── OneSignal send ───────────────────────────────────────────────────────────

async function sendPush({ title, body, dedupeKey }) {
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
      idempotency_key: uuidv5(dedupeKey),
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
  const now = DateTime.now().setZone(cfg.timezone)
  const sent = readSent()
  const { due, missed } = evaluateCountdown(cfg, now, sent)

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

function cmdStatus() {
  const cfg = loadJSON(join(CONFIG_DIR, 'countdown.json'))
  const now = DateTime.now().setZone(cfg.timezone)
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
  else {
    console.error(`unknown command: ${cmd}\nusage: mbzf-notify [run [--dry-run] | status]`)
    process.exit(2)
  }
} catch (err) {
  console.error(`[fatal] ${err.message}`)
  process.exit(1)
}
