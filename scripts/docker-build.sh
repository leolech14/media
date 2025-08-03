#!/bin/bash

echo "🐳 Building Docker image for Video Creator AI..."

# Build production image
docker build -t video-creator-ai:latest .

# Tag with version if provided
if [ ! -z "$1" ]; then
    docker tag video-creator-ai:latest video-creator-ai:$1
    echo "✅ Tagged image as video-creator-ai:$1"
fi

echo "✅ Docker image built successfully!"
echo ""
echo "To run the container:"
echo "  docker-compose up -d"
echo ""
echo "To run in development mode:"
echo "  docker-compose -f docker-compose.dev.yml up"