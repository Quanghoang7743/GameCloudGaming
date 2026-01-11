#!/bin/bash
# Moonlight Web - Frontend Development Server Startup Script

echo "⚡ Starting Next.js Frontend..."
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/moonlight-web/nextjs-frontend" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run development server
echo "Server running at: http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
