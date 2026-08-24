#!/bin/sh
set -e

# If node_modules doesn't exist or is empty, install dependencies
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "Installing dependencies..."
  npm install
fi

exec "$@"