# MBZF — Push Notifications (OneSignal) — Design Spec

**Date:** 2026-07-03
**Product:** MBZF PWA (Miami Beach Zouk Festival 2027)
**Repo:** `stitch-miami-beach-zouk/` (branch `dev` → `main`)
**Owner language:** Portuguese. **End-user / notification language:** English (US).

## Goal

Let festival attendees opt into push notifications from the PWA, then deliver:

1. **Countdown reminders** — automatic, at 200 / 100 / 60 / 30 / 15 / 1 days before the festival.
2. **"Class starting" alerts** — automatic, at each workshop's start time (shifted by a live delay offset).
3. **A "delay" command** — owner triggers via Telegram/Hermes to push all not-yet-sent class alerts back by N minutes when the real schedule slips.

Party alerts and per-category opt-in are explicitly out of scope for v1 (future work).

## Key facts / constraints

- **OneSignal App ID:** `e62fa68b-91d7-4b40-aa7d-97ec3bc6de16` (account already created by owner).
- **iOS reality:** Web Push on iOS works **only** after the PWA is added to the Home Screen (iOS 16.4+). The app already nudges install via `InstallPrompt`.
- **Existing service worker:** the app already ships its own SW (cache v3) at scope `/`. OneSignal's worker must live in a **separate scope** (`/push/`) so the two coexist. This is configurable via `serviceWorkerPath` + `serviceWorkerParam.scope`. Two code fixes are required for coexistence (found in review):
  - **`public/sw.js` must bypass OneSignal hosts.** Its cross-origin handler applies stale-while-revalidate to everything — including `api.onesignal.com`/`cdn.onesignal.com`. Serving stale API responses breaks subscription intermittently. Fix: early-return for `url.hostname.endsWith('onesignal.com')`; bump cache to `miami-zouk-v4`.
  - **`src/main.tsx` dev-mode unregister must spare `/push/`.** In dev it unregisters ALL service workers, which would kill OneSignal's. Fix: filter out registrations whose scope contains `/push/`. (Prod is safe — guard on `import.meta.env.PROD`.) Local push testing therefore uses `npm run build && vite preview` + "Local Testing" enabled in the OneSignal dashboard.
- **Timezone:** all scheduling math uses **America/New_York** (Miami local time). This is the single biggest correctness risk and is fixed here.
- **Countdown target date:** `2027-04-22` (festival start; same as the app's on-screen countdown).
- **Send-to-all:** notifications target the OneSignal `Subscribed Users` segment.

## Architecture — 3 components

### 1. Client (in the PWA) — captures subscribers

- Integrate `react-onesignal`. Init once at app startup:
  ```js
  OneSignal.init({
    appId: 'e62fa68b-91d7-4b40-aa7d-97ec3bc6de16',
    serviceWorkerPath: 'push/OneSignalSDKWorker.js',
    serviceWorkerParam: { scope: '/push/' },
    autoResubscribe: true,
    // no auto-prompt; we drive permission from a dedicated button
  })
  ```
- **Service worker file:** `public/push/OneSignalSDKWorker.js` containing:
  ```js
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
  ```
  This file is served from our origin at `/push/OneSignalSDKWorker.js`, isolated from the app's own SW.
- **UI — dedicated button/toggle** ("🔔 Get festival alerts") placed on the Home page:
  - Not subscribed → button reads "Get festival alerts". On tap:
    - If iOS and **not** installed to Home Screen → show the existing install guidance first (reuse `InstallPrompt` copy), because the OS prompt will not appear otherwise.
    - Else → `OneSignal.Notifications.requestPermission()` (or `OneSignal.Slidedown.promptPush()`).
  - Subscribed → button reads "Alerts on ✓" (tapping opens a short "you're all set / manage in settings" note).
  - Button reflects live state from `OneSignal.Notifications.permission` / subscription state.
- **No visual identity change** beyond adding the button (flamingo palette, existing components/tokens).

### 2. Sender (on the VPS) — fires notifications automatically

A small Node script `mbzf-notify` on the Oracle VPS, run by a **systemd timer every minute**. It owns the clock; it sends immediately when something is due (no reliance on OneSignal's future-scheduling).

Inputs (all on the VPS, outside the app repo):
- `schedule.json` — generated from `src/data/schedule.ts` (see data pipeline below). Only `type === 'workshop'` slots are treated as classes.
- `countdown.json` — `{ target: "2027-04-22", offsetsDays: [200,100,60,30,15,1], sendLocalTime: "10:00", tz: "America/New_York" }`.
- `offset.json` — `{ minutes: 0 }` (current class delay).
- `sent.log` — append-only record of already-sent notification keys, for dedupe/idempotency.

Each run:
1. Compute "now" in `America/New_York`. **All timezone math uses `luxon`** (`DateTime.fromISO(..., { zone: 'America/New_York' })`) — the countdown milestones cross the EDT→EST→EDT transitions (Oct 2026 / Jan–Mar 2027 / Apr 2027), so manual offset arithmetic is a 1-hour bug waiting to happen.
2. **Catch-up window, not exact-minute match** (a rebooted VPS or delayed timer must not silently drop alerts): fire anything whose moment is **due or past-due within a tolerance** and not yet in `sent.log` — classes: up to **10 min late** (older than that → record as `missed`, don't send); countdown: up to **6 h late** (a "100 days" ping at 2 PM still has value).
3. **Countdown:** for each `offsetsDays` value, the fire moment is `target − Ndays` at `sendLocalTime` ET.
4. **Classes:** for each workshop slot, fire moment = slot start (ET) + `offset.minutes`. **Delay auto-reset:** `offset.minutes` resets to 0 every day at **6:00 AM ET** — a schedule delay never survives the night (the owner would otherwise forget `reset` and shift the next day's classes). Manual `reset` still available.
5. Sends go via OneSignal REST API:
   ```
   POST https://api.onesignal.com/notifications
   Authorization: Key <REST_API_KEY>
   { "app_id": "...", "target_channel": "push",
     "included_segments": ["Subscribed Users"],
     "contents": { "en": "<message>" }, "headings": { "en": "<title>" } }
   ```
6. Dedupe key examples: `countdown:200`, `class:d1-1` (slot id). Recorded only after a 2xx response. On `429`, respect `Retry-After` (in practice the next 1-minute tick retries within the catch-up window).

**Idempotency:** we also pass an `idempotency_key` (UUID v5 derived from the dedupe key) so a retry never double-sends even if `sent.log` write fails.

**Message copy (English):**
- Countdown: title `Miami Beach Zouk Festival`, body e.g. `100 days to go! 🦩 Get ready for April 22–26.` (per-offset copy table in the plan).
- Class: title `Now on the floor`, body e.g. `Matheus & Nina — Room 1`. Combined when Room 1 + Room 2 run together: `Room 1: Matheus & Nina · Room 2: Pedro & Ana`. Slots whose title is `Topic T.B.D.` show artist name(s) only — never the placeholder title.

**Secrets:** the OneSignal REST API key lives only on the VPS (e.g. `/opt/mbzf-notify/.env`, mode 600), never committed. Needed only from Phase 2 onward.

### 3. Command channel (Hermes / Telegram)

- CLI on the VPS: `mbzf-notify delay <minutes>` writes `offset.json`; `mbzf-notify reset` sets it to 0; `mbzf-notify status` prints current offset + next due items.
- **Hermes wiring:** add a rule to `SOUL.md` so that when the owner (Indyo) asks in Telegram to delay/reset MBZF classes, Hermes runs the corresponding command (respecting the `cd /home/hermes` gotcha and confirm-before-production rules). Permissions: the `hermes` user gets **write access to `offset.json` only** (group perms on that file), not to the `mbzf-notify` directory.
- Delay is applied only to **not-yet-sent** classes; already-fired alerts are untouched. Offset persists until `reset`.

## Data pipeline (schedule.ts → sender)

- Add an export step (`npm run export:schedule`) that emits `schedule.json` from `src/data/schedule.ts`: for each slot, `{ id, day, time, ampm, type, entries: [{room, artist, title}] }` plus the `days` date map (THU Apr 22 → MON Apr 26, 2027).
- The generated JSON is copied to the VPS (`/opt/mbzf-notify/schedule.json`) when the schedule changes. Keeping app and sender in sync is a manual, deliberate step (schedule rarely changes).

## Phasing

| Phase | Scope | Fires when | Blocker |
|---|---|---|---|
| **1 (now)** | OneSignal Web platform config (Chrome) + client SDK + button + SW file + deploy | subscription live immediately | none; REST key not needed yet |
| **2** | VPS sender infra + systemd timer + countdown config | next countdown ≈ Oct 2026 | REST API key |
| **3** | class alerts + delay CLI + Hermes/SOUL wiring + schedule export | Apr 2027 | schedule.json pipeline |

## OneSignal dashboard config (Phase 1, via Chrome)

- Settings → Platforms → **Web**: choose "Custom Code" setup (we use `react-onesignal`).
- Site name: `Miami Beach Zouk Festival`; Site URL: `https://mbzf.trybobr.com`; default notification icon (flamingo).
- Permission prompt: **disable** auto-prompt (button-driven).
- Confirm the SDK service-worker file path matches `/push/OneSignalSDKWorker.js`.
- No Apple Safari Web Push certificate is required for the iOS **installed-PWA** case (uses standard VAPID web push).

## Testing

- **Phase 1:** deploy; open in Chrome desktop + mobile emulation; tap the button; confirm the subscriber appears in the OneSignal dashboard; send a manual test push from the dashboard and confirm receipt. Real-iPhone confirmation done by the owner (needs a physical device + Home-Screen install).
- **Phase 2/3:** dry-run mode (`mbzf-notify --dry-run` logs what it *would* send). Then a live test using a **test segment scoped to the owner's device only** and a forced near-future date, before enabling `Subscribed Users`.
- Regression: the app's existing SW (offline cache) still works after OneSignal's SW is added (verify both SWs registered, distinct scopes).

## Risks / open points

- **Timezone**: mitigated by fixing `America/New_York` everywhere and using `luxon` for all conversions (DST transitions covered); verified in Phase 2/3 dry-runs.
- **Notification volume** (classes are ~1/hour over 5 days): acceptable for v1; per-category opt-in is the future mitigation if attendees complain.
- **VPS uptime during festival**: the sender depends on the Oracle box being up Apr 22–26; covered by the existing Trybo watchdog.
- **DJ-per-hour alerts and party alerts**: out of scope until the owner supplies a DJ set schedule with times.

## Out of scope (v1)

- Party-start alerts (owner will add later; data model already supports party slots).
- DJ-entering alerts (no set-time data exists yet).
- Per-category subscriber preferences (only "all subscribers" in v1).
- In-app notification inbox / history.
