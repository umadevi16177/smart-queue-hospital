#!/bin/bash

# GStack SmartQueue Bootloader
echo "🏥 Starting SmartQueue Hospital Platform..."

# Function to kill child processes on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

trap cleanup SIGINT

# 1. Start Python Backend
echo "🐍 Booting Python FastAPI Backend on port 8000..."
cd backend
source venv/bin/activate
uvicorn app.main:app --port 8000 --reload &
BACKEND_PID=$!
cd ..

# 2. Wait for Backend
sleep 3

# 3. Start Next.js Frontend
echo "⚛️ Booting Next.js Frontend on port 3000..."
npm run dev &
FRONTEND_PID=$!

echo "✅ All systems operational!"
echo "📡 Backend: http://localhost:8000"
echo "🖥️ Frontend: http://localhost:3000"

# Keep the script running to catch the trap
wait
