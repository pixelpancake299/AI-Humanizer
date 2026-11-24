#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

if ! curl --silent --fail http://localhost:3000/index.html >/dev/null 2>&1; then
  nohup npm run dev -- --hostname 0.0.0.0 > /tmp/ai-humanizer-dev.log 2>&1 < /dev/null &
fi

for attempt in $(seq 1 60); do
  if curl --silent --fail http://localhost:3000/index.html >/dev/null 2>&1; then
    echo "AI Humanizer is running: http://localhost:3000/index.html"
    exit 0
  fi
  sleep 2
done

echo "AI Humanizer did not become ready. Server log:"
tail -n 80 /tmp/ai-humanizer-dev.log || true
exit 0
