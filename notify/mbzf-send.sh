#!/usr/bin/env bash
# Owner-triggered announcement sender. Hermes runs this via a scoped sudoers
# rule as the `ubuntu` user:
#   sudo -u ubuntu /opt/mbzf-notify/mbzf-send.sh "<message>"
# It sources the ubuntu-only .env so the OneSignal REST key never reaches the
# `hermes` user. Hermes always confirms the message with the owner first
# (see SOUL.md). Pass --dry-run as the first arg to print without sending.
set -euo pipefail
cd /opt/mbzf-notify
set -a
. /opt/mbzf-notify/.env
set +a
exec /usr/bin/node /opt/mbzf-notify/src/mbzf-notify.mjs send "$@"
