@echo off
echo ========================================
echo Nutri Kitchen Server Setup and Start
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 2: Checking .env file...
if not exist .env (
    echo WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and set your DATABASE_URL and JWT_SECRET
    echo Press any key to open .env file...
    pause
    notepad .env
)
echo.

echo Step 3: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo.

echo Step 4: Pushing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ERROR: Failed to push database schema
    pause
    exit /b 1
)
echo.

echo Step 5: Seeding database (optional)...
set /p seed="Do you want to seed the database with default products? (y/n): "
if /i "%seed%"=="y" (
    call npm run seed
)
echo.

echo ========================================
echo Setup complete! Starting server...
echo ========================================
echo.
echo Server will start on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

call npm run dev
