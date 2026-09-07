#!/bin/bash
cd "$(dirname "$0")"
PORT=8080
URL="http://localhost:${PORT}"

echo ""
echo "Virginie Palermo portfolio — local preview"
echo "Opening ${URL}"
echo "Press Control-C in this window to stop the preview server."
echo ""

if command -v python3 >/dev/null 2>&1; then
  (sleep 0.8; open "$URL") &
  exec python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  (sleep 1.5; open "$URL") &
  exec npx --yes serve . -l "$PORT"
else
  echo "No local web server was found."
  echo "Install Python 3 or Node.js, then run this file again."
  read -n 1 -s -r -p "Press any key to close..."
fi
