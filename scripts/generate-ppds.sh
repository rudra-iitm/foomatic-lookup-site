#!/bin/bash

export PATH="/usr/bin:/usr/sbin:/sbin:/bin:$PATH"

BASE_DIR=$(pwd)
DB_SOURCE_DIR="$BASE_DIR/cache/foomatic-sources"
OUTPUT_DIR="$BASE_DIR/public/ppds"

# Ensure output directory exists even if skipping generation
mkdir -p "$OUTPUT_DIR"

if [ "${SKIP_PPD_GEN}" = "true" ]; then
  echo "⏭️  Skipping PPD generation"
  exit 0
fi

if ! which foomatic-compiledb >/dev/null 2>&1; then
    echo "❌ foomatic-compiledb not found. Please install dependencies before running this script."
    exit 1
fi

echo "🔧 Setting up directories..."
mkdir -p "$DB_SOURCE_DIR"

echo "⬇️  Fetching Foomatic Database..."

if [ ! -d "$DB_SOURCE_DIR/foomatic-db" ]; then
    git clone --depth 1 https://github.com/OpenPrinting/foomatic-db.git "$DB_SOURCE_DIR/foomatic-db"
else
    echo "Updating foomatic-db..."
    (cd "$DB_SOURCE_DIR/foomatic-db" && git pull -q) || { echo "Failed to update foomatic-db repository"; exit 1; }
fi

if [ ! -d "$DB_SOURCE_DIR/foomatic-db-nonfree" ]; then
    git clone --depth 1 https://github.com/OpenPrinting/foomatic-db-nonfree.git "$DB_SOURCE_DIR/foomatic-db-nonfree"
else
    echo "Updating foomatic-db-nonfree..."
    (cd "$DB_SOURCE_DIR/foomatic-db-nonfree" && git pull -q) || { echo "Failed to update foomatic-db-nonfree repository"; exit 1; }
fi

echo "⚙️  Compiling PPD files (This may take a while)..."

# Symlink the database to the system location where foomatic-compiledb expects it
# Define sudo command if not root
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then
        SUDO="sudo"
    else
        echo "⚠️  Running as non-root and 'sudo' is not available."
        echo "   This script requires permissions to write to /usr/share/foomatic/db."
        echo "   Please run as root or ensure you have sudo privileges."
        exit 1
    fi
fi

echo "🔗 Symlinking Foomatic database to /usr/share/foomatic/db..."
$SUDO mkdir -p /usr/share/foomatic
if [ -d "/usr/share/foomatic/db" ]; then
    $SUDO rm -rf /usr/share/foomatic/db
fi
$SUDO ln -s "$DB_SOURCE_DIR/foomatic-db/db" /usr/share/foomatic/db

if ! foomatic-compiledb -t ppd -j 4 -d "$OUTPUT_DIR" -f; then
    echo "❌ Compilation failed"
    exit 1
fi

FILE_COUNT=$(find "$OUTPUT_DIR" -type f | wc -l)

if [ "$FILE_COUNT" -gt 0 ]; then
    echo "✅ Success! Generated $FILE_COUNT PPD files in $OUTPUT_DIR"
else
    echo "❌ Error: Compilation finished but 'public/ppds' is still empty."
    exit 1
fi
