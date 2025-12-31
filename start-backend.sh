#!/bin/bash
# Moonlight Web - Backend Server Startup Script

echo "🚀 Starting Moonlight Web Backend..."
echo ""

# Navigate to web-server directory
cd "$(dirname "$0")/moonlight-web/web-server" || exit 1

# Source Rust environment
source "$HOME/.cargo/env"

# Run the server
echo "Server running at: http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""

../../target/release/web-server
