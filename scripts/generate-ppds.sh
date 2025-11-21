export PATH="/usr/bin:/usr/sbin:/sbin:/bin:$PATH"

if ! which foomatic-compiledb >/dev/null 2>&1; then
    echo "❌ foomatic-compiledb not found. Please install dependencies before running this script."
    exit 1
fi


BASE_DIR=$(pwd)
DB_SOURCE_DIR="$BASE_DIR/cache/foomatic-sources"
OUTPUT_DIR="$BASE_DIR/public/ppds"

echo "🔧 Setting up directories..."
mkdir -p "$DB_SOURCE_DIR"
mkdir -p "$OUTPUT_DIR"

echo "⬇️  Fetching Foomatic Database..."

if [ ! -d "$DB_SOURCE_DIR/foomatic-db" ]; then
    git clone --depth 1 https://github.com/OpenPrinting/foomatic-db.git "$DB_SOURCE_DIR/foomatic-db"
else
    echo "Updating foomatic-db..."
    cd "$DB_SOURCE_DIR/foomatic-db" && git pull -q && cd "$BASE_DIR"
fi

if [ ! -d "$DB_SOURCE_DIR/foomatic-db-nonfree" ]; then
    git clone --depth 1 https://github.com/OpenPrinting/foomatic-db-nonfree.git "$DB_SOURCE_DIR/foomatic-db-nonfree"
else
    echo "Updating foomatic-db-nonfree..."
    cd "$DB_SOURCE_DIR/foomatic-db-nonfree" && git pull -q && cd "$BASE_DIR"
fi

echo "⚙️  Compiling PPD files (This may take a while)..."

export FOOMATICDB="$DB_SOURCE_DIR/foomatic-db/db:$DB_SOURCE_DIR/foomatic-db-nonfree/db"

echo "DEBUG: FOOMATICDB is set to: $FOOMATICDB"

foomatic-compiledb -t ppd -j 4 -d "$OUTPUT_DIR" -f

FILE_COUNT=$(find "$OUTPUT_DIR" -type f | wc -l)

if [ "$FILE_COUNT" -gt 0 ]; then
    echo "✅ Success! Generated $FILE_COUNT PPD files in $OUTPUT_DIR"
else
    echo "❌ Error: Compilation finished but 'public/ppds' is still empty."
    exit 1
fi