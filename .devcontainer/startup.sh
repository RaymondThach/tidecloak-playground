#!/bin/bash
set -e

# Determine the correct public URL
CODESPACE_URL_NEXT=$([ "$CODESPACES" = "true" ] && echo "https://${CODESPACE_NAME}-3000.app.github.dev" || echo "http://localhost:3000")

# Make port 8080 public (if in Codespaces)
if [ "$CODESPACES" = "true" ]; then
  echo "🔓 Making port 8080 public..."
  gh codespace ports visibility 8080:public --codespace "$CODESPACE_NAME"
fi

# Start the dev server in the background
echo "🚀 Starting Next.js dev server..."
npm run dev &
DEV_PID=$!

# Wait for the server to be ready
echo "⏳ Waiting for $CODESPACE_URL_NEXT to respond..."
until curl -s -o /dev/null -w "%{http_code}" "$CODESPACE_URL_NEXT" | grep -q "200"; do
  sleep 2
done

echo "✅ Server is up at $CODESPACE_URL_NEXT"

# Wait on the dev server process to keep the container running
wait $DEV_PID
