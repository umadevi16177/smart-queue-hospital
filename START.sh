#!/bin/bash

# GStack Smart Queue Bootloader
echo "🏥 Starting Smart Queue Hospital Platform..."

# Function to kill child processes on exit
cleanup() {
    echo "🛑 Shutting down server..."
    kill $BACKEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT

# Load recently installed NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 1. Start Python Backend
echo "🐍 Booting Unified Python FastAPI Backend on port 8000..."
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Failsafe short wait to let python boot
sleep 2

# 2. Start Next.js Native
echo "⚛️ Loading dependencies and Booting Next.js Native Server on port 3000..."
npm install
npm run dev -- -H 0.0.0.0 &
FRONTEND_PID=$!

echo "✅ All systems operational!"
echo "📡 NextJS Dashboard: http://0.0.0.0:3000"
echo "📡 FastAPI Backend: http://0.0.0.0:8000"

# Keep the script running to catch the trap
wait
