#!/usr/bin/env bash
# Drains state/announce.queue — one push per non-empty line. Runs as `ubuntu`
# via mbzf-announce.path whenever Hermes appends a line (no sudo involved:
# Hermes only writes to the queue file; the REST key stays ubuntu-only).
#
# Line formats:
#   "message"              → title = message, body = default CTA
#   "message || detail"    → title = message, body = detail (owner-controlled)
#   "DRY: ..."             → dry-run (plumbing test, nothing sent)
# Outcomes land in state/announce.log (hermes-readable) for confirmation.
set -euo pipefail
cd /opt/mbzf-notify
Q=state/announce.queue
LOG=state/announce.log

exec 9>state/.announce.lock
flock 9

[ -s "$Q" ] || exit 0

set -a
. ./.env
set +a

mapfile -t lines < "$Q"
: > "$Q"

for line in "${lines[@]}"; do
  msg="$(printf '%s' "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  [ -z "$msg" ] && continue
  args=(send)
  if [[ "$msg" == DRY:* ]]; then
    args+=(--dry-run)
    msg="$(printf '%s' "${msg#DRY:}" | sed -e 's/^[[:space:]]*//')"
  fi
  # "title || detail" → explicit body; otherwise 1-arg (default CTA body).
  if [[ "$msg" == *" || "* ]]; then
    title="$(printf '%s' "${msg%% || *}" | sed -e 's/[[:space:]]*$//')"
    detail="$(printf '%s' "${msg#* || }" | sed -e 's/^[[:space:]]*//')"
    out=$(/usr/bin/node src/mbzf-notify.mjs "${args[@]}" "$title" "$detail" 2>&1) && rc=0 || rc=1
  else
    out=$(/usr/bin/node src/mbzf-notify.mjs "${args[@]}" "$msg" 2>&1) && rc=0 || rc=1
  fi
  if [ "$rc" -eq 0 ]; then
    echo "$(date -u +%FT%TZ) OK ${out}" >> "$LOG"
  else
    echo "$(date -u +%FT%TZ) ERRO ${out}" >> "$LOG"
  fi
done
