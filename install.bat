@echo off
echo ========================================
echo Medium Clone - Installation Script
echo ========================================
echo.

echo [1/4] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Server dependencies installation failed!
    pause
    exit /b 1
)
echo Server dependencies installed successfully!
echo.

echo [2/4] Installing client dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Client dependencies installation failed!
    pause
    exit /b 1
)
echo Client dependencies installed successfully!
echo.

echo [3/4] Checking environment files...
cd ..
if not exist "server\.env" (
    echo WARNING: server/.env not found!
    echo Please configure server/.env before running the app.
)
if not exist "client\.env" (
    echo WARNING: client/.env not found!
    echo Please configure client/.env before running the app.
)
echo.

echo [4/4] Installation complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Configure server/.env with your credentials
echo 2. Configure client/.env with your Google OAuth ID
echo 3. Start MongoDB: mongod
echo 4. Start server: cd server ^&^& npm run dev
echo 5. Start client: cd client ^&^& npm run dev
echo.
echo For detailed setup instructions, see SETUP.md
echo ========================================
pause
