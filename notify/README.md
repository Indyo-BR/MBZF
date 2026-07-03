# mbzf-notify — MBZF push scheduler (VPS-side)

Fires OneSignal push notifications from the festival timeline. Runs on the Oracle
VPS (the always-on box), **not** part of the web app deploy (GitHub Actions only
rsyncs `dist/`, so this `notify/` folder is versioned but never served).

It owns the clock: a systemd timer runs it periodically; each run computes what is
due "now" in Miami time (`America/New_York`, via luxon so DST is correct) and
sends immediately via the OneSignal REST API. No reliance on OneSignal's own
future-scheduling.

## What it sends

- **Countdown milestones** — 200 / 100 / 60 / 30 / 15 / 1 days before `2027-04-22`
  at 10:00 Miami time. Config: [config/countdown.json](config/countdown.json).
- **Class-start alerts** — one push at each workshop's start time (only
  `type: workshop` slots), shifted by the current delay. Data:
  [config/schedule.json](config/schedule.json), regenerated from the app's
  `src/data/schedule.ts` with `node export-schedule.mjs`.

## Commands

```bash
node src/mbzf-notify.mjs status           # now, milestones, class delay, what's due
node src/mbzf-notify.mjs run --dry-run     # print what would send, send nothing
node src/mbzf-notify.mjs run               # send anything due, record it
node src/mbzf-notify.mjs delay 20          # push today's remaining classes 20 min later
node src/mbzf-notify.mjs delay +15         # add 15 more (relative); -N pulls earlier
node src/mbzf-notify.mjs reset             # clear the delay now
```

The class delay applies only to not-yet-sent classes and **auto-resets at 06:00
Miami time** (the boundary sits at 6 AM so late-night parties don't roll the day
over). `MBZF_NOW=<iso>` overrides "now" for rehearsal/testing.

State lives in `state/sent.log` (git-ignored): one line per handled key
(`countdown:100  <iso>  sent <id>` or `... missed`). Dedupe reads it; a key is
never sent twice. `--dry-run` never writes.

## Environment (`/opt/mbzf-notify/.env`, mode 600, never committed)

```
ONESIGNAL_APP_ID=e62fa68b-91d7-4b40-aa7d-97ec3bc6de16
ONESIGNAL_REST_API_KEY=<from OneSignal dashboard → Settings → Keys & IDs>
# optional overrides:
# MBZF_SEGMENT=Subscribed Users
```

## Deploy (VPS)

1. `rsync` this folder to `/opt/mbzf-notify` (exclude `state/`, `node_modules/`, `.env`).
2. `cd /opt/mbzf-notify && npm ci --omit=dev`.
3. Create `.env` (above) with the REST API key; `chmod 600 .env`.
4. In `systemd/mbzf-notify.service`, replace `NODE_BIN` with the absolute node path
   (`command -v node`).
5. Install units, enable the timer:
   ```bash
   sudo cp systemd/mbzf-notify.{service,timer} /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now mbzf-notify.timer
   ```
6. Verify: `node src/mbzf-notify.mjs status`, then `systemctl list-timers | grep mbzf`.

## Safe first live test

Point at a test audience before the whole segment:

- In the OneSignal dashboard create a segment (e.g. `test-owner`) filtered to the
  owner's device, set `MBZF_SEGMENT=test-owner` in `.env`, temporarily add a
  milestone whose fire moment is ~2 min out, watch it deliver, then revert.
