#!/usr/bin/env bash
# Drains state/announce.queue. Confirmation-gated, and every failure mode is
# fail-SAFE (nothing sends) because the confirming actor is an LLM that has
# been observed retrying CONFIRM until a plain time-gate passed (see repo
# history): premature confirmation now CANCELS the draft instead of waiting.
#
#   "<message>" / "<message> || <detail>"  → stored as the DRAFT (never sent)
#   "CONFIRM"                              → sends the draft ONLY if all pass:
#       age >= MIN_GAP   (owner replied in a separate turn; a model retrying in
#                         the same turn arrives early → draft is DELETED, so
#                         retry-spam can never converge on a send)
#       age <= EXPIRY    (no confirming a stale draft from an old conversation)
#       last send >= THROTTLE ago (caps blast rate; pending is kept)
#   "DRY:" prefix on the draft             → dry-run rehearsal, nothing sent
#
# Outcomes → state/announce.log: DRAFT / SENT / CANCELLED / EXPIRED /
# THROTTLED / IGNORED / ERR. Runs as `ubuntu` (sole REST-key holder); Hermes
# only ever appends lines to the queue.
set -euo pipefail
cd /opt/mbzf-notify
Q=state/announce.queue
PENDING=state/announce.pending
LAST_SENT=state/announce.last_sent
LOG=state/announce.log
MIN_GAP="${MBZF_MIN_CONFIRM_GAP:-20}"
EXPIRY="${MBZF_DRAFT_EXPIRY:-900}"
THROTTLE="${MBZF_SEND_THROTTLE:-60}"

exec 9>state/.announce.lock
flock 9
[ -s "$Q" ] || exit 0

set -a
. ./.env
set +a

mapfile -t lines < "$Q"
: > "$Q"

send_pending() { # sends $PENDING content; honors an optional "DRY:" prefix
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
      echo "$ts IGNORED nao-ha-rascunho (escreva a mensagem, mostre ao dono, espere ele responder)" >> "$LOG"
      continue
    fi
    age=$(( $(date +%s) - $(stat -c %Y "$PENDING") ))
    if [ "$age" -lt "$MIN_GAP" ]; then
      # Premature = same model turn. Delete the draft so retrying can never
      # succeed; the only path to a send is a fresh draft + a human-paced OK.
      rm -f "$PENDING"
      echo "$ts CANCELLED confirmacao-prematura ${age}s<${MIN_GAP}s — rascunho DESCARTADO. NAO reenvie CONFIRM: mostre o preview ao dono e espere a resposta dele; depois escreva o rascunho de novo e confirme só no turno seguinte." >> "$LOG"
    elif [ "$age" -gt "$EXPIRY" ]; then
      rm -f "$PENDING"
      echo "$ts EXPIRED rascunho com ${age}s (> ${EXPIRY}s) — velho demais, recomece com o dono." >> "$LOG"
    elif [ -f "$LAST_SENT" ] && [ $(( $(date +%s) - $(stat -c %Y "$LAST_SENT") )) -lt "$THROTTLE" ]; then
      echo "$ts THROTTLED ultimo envio ha menos de ${THROTTLE}s — aguarde e confirme de novo." >> "$LOG"
    elif out=$(send_pending); then
      echo "$ts SENT $out" >> "$LOG"
      rm -f "$PENDING"
      touch "$LAST_SENT"
    else
      echo "$ts ERR $out" >> "$LOG"
      rm -f "$PENDING"
    fi
  else
    printf '%s' "$line" > "$PENDING"
    echo "$ts DRAFT $line" >> "$LOG"
  fi
done
