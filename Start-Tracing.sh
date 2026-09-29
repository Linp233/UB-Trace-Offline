#!/bin/sh
set -eu
APP_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
if [ ! -x "$APP_DIR/runtime/node" ]; then
  echo 'Bundled runtime/node is missing or not executable.' >&2
  exit 1
fi
exec "$APP_DIR/runtime/node" "$APP_DIR/scripts/posix-launcher.mjs" start "$@"
