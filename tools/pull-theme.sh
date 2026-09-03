#!/usr/bin/env bash
# Pull the real Liquid source for the Aquavape theme.
#
# This CANNOT run from the Claude Code container: outbound network is blocked
# and the pull needs store credentials. Run it on your own machine.
#
# Prereqs:
#   npm i -g @shopify/cli @shopify/theme
#   Staff or collaborator access to disposablevapesuk.myshopify.com
#
# Usage:
#   ./scripts/pull-theme.sh            # interactive browser login
#   SHOPIFY_CLI_THEME_TOKEN=… ./scripts/pull-theme.sh   # CI / token auth
#
# Never commit the token. Use a Theme Access app password
# (Shopify admin → Apps → Theme Access) rather than an admin API key.

set -euo pipefail

STORE="${STORE:-disposablevapesuk.myshopify.com}"
THEME_ID="${THEME_ID:-133665358009}"   # "[Main] AquaVape" as of 2026-09-03
DEST="${DEST:-theme}"

echo "Pulling theme $THEME_ID from $STORE into ./$DEST"

# List themes first so you can confirm the id has not changed.
shopify theme list --store "$STORE"

mkdir -p "$DEST"
shopify theme pull --store "$STORE" --theme "$THEME_ID" --path "$DEST"

cat <<'NOTE'

Done. You should now have:
  theme/assets/        theme/config/        theme/layout/
  theme/locales/       theme/sections/      theme/snippets/
  theme/templates/

Next:
  - config/settings_data.json holds the live brand colours and section content.
    Treat it as data, not source — it is overwritten on every merchant edit.
  - assets/theme.css and assets/theme.js are BUILD OUTPUT. Find the upstream
    source (likely a separate repo with the SCSS/JS entrypoints) before
    editing, or you will lose the changes on the next deploy.
  - Work on a DEVELOPMENT theme, never the live one:
        shopify theme dev --store STORE
NOTE
