#!/bin/sh
# Copy the shared Kettlekite base (kk.css + self-hosted fonts) from this repo into every game site
# next to it (../kettlekite-*), so each site stays self-contained. Run after changing assets/kk.css.
set -e
here="$(cd "$(dirname "$0")/.." && pwd)"
for site in "$here"/../kettlekite-*/; do
  [ -f "$site/CNAME" ] || continue
  [ "$(cd "$site" && pwd)" = "$here" ] && continue
  mkdir -p "$site/assets/fonts"
  cp "$here/assets/kk.css" "$site/assets/kk.css"
  cp "$here/assets/fonts/"* "$site/assets/fonts/"
  echo "synced $(basename "$site")"
done
