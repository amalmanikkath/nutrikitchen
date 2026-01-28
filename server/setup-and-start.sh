#!/bin/bash

echo "========================================"
echo "Nutri Kitchen Server Setup and Start"
echo "========================================"
echo ""

echo "Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo ""

echo "Step 2: Checking .env file..."
if [ ! -f .env ]; then
    echo "WARNING: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit .env file and set your DATABASE_URL and JWT_SECRET"
    echo "Opening .env file..."
    ${EDITOR:-nano} .env
fi
echo ""

echo "Step 3: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma client"
    exit 1
fi
echo ""

echo "Step 4: Pushing database schema..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to push database schema"
    exit 1
fi
echo ""

echo "Step 5: Seeding database (optional)..."
read -p "Do you want to seed the database with default products? (y/n): " seed
if [ "$seed" = "y" ] || [ "$seed" = "Y" ]; then
    npm run seed
fi
echo ""

echo "========================================"
echo "Setup complete! Starting server..."
echo "========================================"
echo ""
echo "Server will start on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
