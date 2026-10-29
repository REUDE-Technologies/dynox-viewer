#!/usr/bin/env bash
# Upload the DynoX 3D models and manuals to a Cloudflare R2 bucket.
# Needs: Node.js, and `npx wrangler login` done once (or CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID set).
# Usage: tools/upload-r2.sh <bucket-name> [prefix]    e.g. tools/upload-r2.sh reude-assets dynox
set -euo pipefail
BUCKET="${1:?bucket name required}"
PREFIX="${2:-}"; [ -n "$PREFIX" ] && PREFIX="${PREFIX%/}/"
cd "$(dirname "$0")/.."
for f in model/*.glb; do
  npx --yes wrangler r2 object put "$BUCKET/${PREFIX}$f" --file "$f" --remote \
    --content-type model/gltf-binary --cache-control "public, max-age=86400"
done
for f in manuals/*.pdf; do
  npx --yes wrangler r2 object put "$BUCKET/${PREFIX}$f" --file "$f" --remote \
    --content-type application/pdf --content-disposition "attachment; filename=\"$(basename "$f")\"" \
    --cache-control "public, max-age=3600"
done
echo "Uploaded. Set ASSET_BASE in site.config.js to the bucket's public URL${PREFIX:+ followed by $PREFIX}."
