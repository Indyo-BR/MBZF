#!/usr/bin/env bash
# Drains state/announce.queue. Two-step, confirmation-gated so a weak model
# can't ask "confirma?" and send in the same turn:
#
#   line "<message>" / "<message> || <detail>"  → stored as a DRAFT (not sent)
#   line "CONFIRM"                              → sends the draft, but ONLY if
#                                                 the draft is >= MIN_GAP seconds
#                                                 old (i.e. the confirmation came
#                                                 in a SEPARATE turn from a human,
#                                                 not milliseconds later in the
#                                                 same model turn)
#   "DRY:" prefix on the draft                 → dry-run (rehearsal, nothing sent)
#
# The time gap is the gate: a real owner reacts in seconds; a model doing
# draft+CONFIRM in one turn does it in ~2s and gets BLOCKED. Runs as `ubuntu`
# (the REST key holder); Hermes only ever appends to the queue.
set -euo pipefail
cd /opt/mbzf-notify
Q=state/announce.queue
PENDING=state/announce.pending
LOG=state/announce.log
MIN_GAP="${MBZF_MIN_CONFIRM_GAP:-8}"

exec 9>state/.announce.lock
flock 9
[ -s "$Q" ] || exit 0

set -a
. ./.env
set +a

mapfile -t lines < "$Q"
: > "$Q"

send_pending() { # sends the $PENDING content; honors an optional "DRY:" prefix
  local msg args=(send) title detail
  msg="$(cat "$PENDING")"
  if [[ "$msg" == DRY:* ]]; then
    args+=(--dry-run)
    msg="$(printf '%s' "${msg#DRY:}" | sed 's/^[[:space:]]*//')"
  fi
  if [[ "$msg" == *" || "* ]]; then
    title="$(printf '%s' "${msg%% || *}" | sed 's/[[:space:]]*$//')"
    detail="$(printf '%s' "${msg#* || }" | sed 's/^[[:space:]]*//')"
    /usr/bin/node src/mbzf-notify.mjs "${args[@]}" "$title" "$detail" 2>&1
  else
    /usr/bin/node src/mbzf-notify.mjs "${args[@]}" "$msg" 2>&1
  fi
}

for raw in "${lines[@]}"; do
  line="$(printf '%s' "$raw" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  [ -z "$line" ] && continue
  ts="$(date -u +%FT%TZ)"
  upper="$(printf '%s' "$line" | tr '[:lower:]' '[:upper:]')"

  if [ "$upper" = "CONFIRM" ] || [ "$upper" = "CONFIRMAR" ]; then
    if [ ! -f "$PENDING" ]; then
      echo "$ts IGNORED confirm-sem-rascunho" >> "$LOG"
    else
      age=$(( $(date +%s) - $(stat -c %Y "$PENDING") ))
      if [ "$age" -lt "$MIN_GAP" ]; then
        echo "$ts BLOCKED confirmacao-rapida-demais ${age}s<${MIN_GAP}s (precisa ser turno separado do dono)" >> "$LOG"
      elif out=$(send_pending); then
        echo "$ts SENT $out" >> "$LOG"
        rm -f "$PENDING"
      else
        echo "$ts ERR $out" >> "$LOG"
      fi
    fi
  else
    # any other line is a DRAFT: store it, reset its age, send nothing
    printf '%s' "$line" > "$PENDING"
    echo "$ts DRAFT $line" >> "$LOG"
  fi
done
