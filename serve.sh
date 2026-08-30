#!/usr/bin/env bash
# Serve the site locally on http://localhost:5173
cd "$(dirname "$0")"
PORT="${1:-5173}"
echo "→ http://localhost:$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1
