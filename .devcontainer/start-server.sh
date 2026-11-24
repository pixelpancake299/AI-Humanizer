#!/bin/sh
set -eu

log_file=/tmp/draftmate.log
PORT=8500 nohup npm run start > "$log_file" 2>&1 < /dev/null &
server_pid=$!

attempt=0
while [ "$attempt" -lt 30 ]; do
  if node -e 'fetch("http://127.0.0.1:8500/api/health").then(response => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1))' >/dev/null 2>&1; then
    exit 0
  fi

  if ! kill -0 "$server_pid" 2>/dev/null; then
    cat "$log_file"
    exit 1
  fi

  attempt=$((attempt + 1))
  sleep 1
done

cat "$log_file"
kill "$server_pid" 2>/dev/null || true
exit 1
