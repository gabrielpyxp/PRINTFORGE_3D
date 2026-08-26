#!/bin/sh
set -e

# Se node_modules não existe ou está vazio, instala
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
  echo "Installing dependencies..."
  npm install
fi

exec "$@"