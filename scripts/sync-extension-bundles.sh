#!/usr/bin/env bash
# Vendor the built webpack content-script bundle into the two runtime copies.
#
# The extension has ONE source of truth — this repo (`content.js`) — but the
# bundle it produces is loaded from two vendored locations:
#
#   ../mlx-video-host/docker/stack/services/sap-batch/extension/
#   ../puppeteer/sap/extension/            (bind-mounted into puppeteer-local)
#
# Editing `content.js` alone does nothing until the bundle is rebuilt
# (`npm run build`) and copied to both, so keep this in the build path.
#
#   ./scripts/sync-extension-bundles.sh
#
# Override the sibling root with SAP_EXT_SIBLINGS=/path/to/Source.
set -euo pipefail
cd "$(dirname "$0")/.."

BUNDLE="bundle/content.bundle.js"
if [ ! -f "$BUNDLE" ]; then
  echo "Missing $BUNDLE — run: npm run build" >&2
  exit 1
fi

SIBLINGS="${SAP_EXT_SIBLINGS:-..}"
DESTINATIONS=(
  "$SIBLINGS/mlx-video-host/docker/stack/services/sap-batch/extension/content.bundle.js"
  "$SIBLINGS/puppeteer/sap/extension/content.bundle.js"
)

PAGE="sap-field-commit.js"
if [ ! -f "$PAGE" ]; then
  echo "Missing $PAGE" >&2
  exit 1
fi

for dest in "${DESTINATIONS[@]}"; do
  if [ -d "$(dirname "$dest")" ]; then
    cp "$BUNDLE" "$dest"
    cp "$PAGE" "$(dirname "$dest")/sap-field-commit.js"
    echo "synced -> $dest"
  else
    echo "skip (missing dir): $dest" >&2
  fi
done

echo "Done. Restart the SAP container to pick up the new content script:"
echo "  cd $SIBLINGS/puppeteer && docker compose restart puppeteer"
