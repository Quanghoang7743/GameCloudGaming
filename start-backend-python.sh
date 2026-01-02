#!/bin/bash


set -e  # Exit on error

echo "🚀 Starting Backend Python Server..."
echo "=================================="

# Navigate to backend-python directory
cd "$(dirname "$0")/backend-python"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
echo "Checking dependencies..."
if ! ./venv/bin/python -c "import fastapi" 2>/dev/null; then
    echo "Installing dependencies..."
    ./venv/bin/pip install -r requirements.txt
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env file with default settings..."
    cat > .env << EOF
DATABASE_URL=mysql+pymysql://root:quang2110@localhost:3306/gamecloud
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
EOF
    echo "✓ .env file created"
fi

# Display server information
echo ""
echo "=================================="
echo "✓ Server starting..."
echo "📍 API URL: http://localhost:8001"
echo "📖 API Docs: http://localhost:8001/docs"
echo "🔄 ReDoc: http://localhost:8001/redoc"
echo "=================================="
echo ""

# Start the server
./venv/bin/uvicorn apps.main:app --reload --host 0.0.0.0 --port 8001
