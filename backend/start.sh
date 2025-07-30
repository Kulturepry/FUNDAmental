#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Push database schema
echo "Setting up database schema..."
npx prisma db push --accept-data-loss

# Run database setup script
echo "Running database setup..."
node setup-db.js

# Start the server
echo "Starting FUNDAmental backend server..."
npm start 