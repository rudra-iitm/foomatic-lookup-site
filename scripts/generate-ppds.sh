#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CACHE_LIB_DIR="$ROOT_DIR/cache/foomatic-db"
CACHE_DB_DIR="$CACHE_LIB_DIR/db"
SYSTEM_LIB_DIR="/usr/share/foomatic"
SYSTEM_DB_DIR="$SYSTEM_LIB_DIR/db"
OUTPUT_DIR="$ROOT_DIR/public/ppds"

mkdir -p "$OUTPUT_DIR"

if [[ "${1:-}" == "--skip-ppd" || "${SKIP_PPD_GEN:-false}" == "true" ]]; then
  echo "Skipping PPD generation"
  exit 0
fi

if ! command -v foomatic-compiledb >/dev/null 2>&1; then
  echo "foomatic-compiledb not found; skipping PPD generation"
  exit 0
fi

if [[ -d "$CACHE_DB_DIR" ]]; then
  export FOOMATICDB="$CACHE_LIB_DIR"
  echo "Using workspace Foomatic DB at $CACHE_DB_DIR"
elif [[ -d "$SYSTEM_DB_DIR" ]]; then
  export FOOMATICDB="$SYSTEM_LIB_DIR"
  echo "Using system Foomatic DB at $SYSTEM_DB_DIR"
else
  echo "Foomatic DB not found in $CACHE_DB_DIR or $SYSTEM_DB_DIR; skipping PPD generation"
  exit 0
fi

echo "FOOMATICDB=$FOOMATICDB"
echo "Generating PPD files into $OUTPUT_DIR"
foomatic-compiledb -t ppd -j 4 -d "$OUTPUT_DIR" -f

FILE_COUNT="$(find "$OUTPUT_DIR" -type f | wc -l | tr -d ' ')"
echo "Generated $FILE_COUNT PPD files"
