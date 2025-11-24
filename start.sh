#!/bin/bash

echo "Starting backend..."
cd backend
node server.js &
BACKEND_PID=$!

echo "Starting frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Waiting 3 seconds for frontend to boot..."
sleep 3

echo "Starting Electron..."
cd ../electron
npm run start-electron

