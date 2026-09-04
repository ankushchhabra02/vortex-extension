#!/usr/bin/env bash
# Builds the zip to upload to the Chrome Web Store.
# The store wants the files at the archive root, not inside a folder.
set -euo pipefail

VERSION=$(python3 -c "import json;print(json.load(open('manifest.json'))['version'])")
OUT="vortex-search-${VERSION}.zip"

rm -f "$OUT"
zip -rq "$OUT" \
  manifest.json background.js panel.html panel.js api.js md.js \
  style.css chat.css icons vendor \
  -x '*.DS_Store' 'vendor/*.map'

echo "$OUT"
unzip -l "$OUT" | tail -3
