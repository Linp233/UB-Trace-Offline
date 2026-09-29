#!/bin/sh
APP_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
exec "$APP_DIR/Start-Tracing.sh" "$@"
