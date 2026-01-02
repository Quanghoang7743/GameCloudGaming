#!/bin/bash

# Script để dừng backend Python server
# Author: Auto-generated
# Date: 2026-01-01

echo "🛑 Stopping Backend Python Server..."

# Find and kill uvicorn process
pkill -f "uvicorn apps.main:app" && echo "✓ Server stopped successfully" || echo "⚠️  No running server found"
