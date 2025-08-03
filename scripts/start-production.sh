#!/bin/bash

echo "🚀 Starting Social AI Pro in production mode..."

# Set production environment
export NODE_ENV=production

# Use PORT from environment or default to 3000
PORT=${PORT:-3000}

# Log startup info
echo "📍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"
echo "🌐 URL: https://social-ai.pro"

# Start the server
exec node src/server.js