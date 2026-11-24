#!/usr/bin/env bash
set -e

if ! curl --silent --fail http://localhost:3000 >/dev/null 2>&1; then
  nohup npm run dev -- --hostname 0.0.0.0 > /tmp/ai-humanizer-dev.log 2>&1 < /dev/null &
fi

for attempt in $(seq 1 30); do
  if curl --silent --fail http://localhost:3000 >/dev/null 2>&1; then
    echo "AI Humanizer is running on port 3000."
    exit 0
  fi
  sleep 2
done

echo "The server is still starting. Check /tmp/ai-humanizer-dev.log if port 3000 does not open."
exit 0
