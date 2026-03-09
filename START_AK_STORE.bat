@echo off
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

:: Kill any existing processes on ports to prevent errors
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /PID 15812 >nul 2>&1
taskkill /F /PID 8296 >nul 2>&1

echo ====================================================
0. Initializing Database with Seed Data...
echo ====================================================
call venv\Scripts\activate.bat
python -m backend.seed

echo.
echo ====================================================
1. Starting Backend and Web Store (Vite)...
echo ====================================================
start "AK STORE - Web & Backend" cmd /k "npm run dev"

echo.
echo ====================================================
2. Waiting for Android Device via USB...
echo PLEASE CONNECT YOUR PHONE NOW!
echo ====================================================
:: Use the SDK path we found earlier
set "ADB=C:\AndroidSDK\platform-tools\adb.exe"
%ADB% wait-for-device
echo Device Found! Setting up port forwarding...
%ADB% reverse tcp:8000 tcp:8000
%ADB% reverse tcp:8081 tcp:8081

echo.
echo ====================================================
3. Starting Metro Bundler...
echo ====================================================
start "AK STORE - Metro" cmd /k "cd Akstore_app && npm start"

echo.
echo ====================================================
4. Building and Running App on Phone...
echo ====================================================
start "AK STORE - Android Build" cmd /k "cd Akstore_app && start-mobile.bat"

echo.
echo All processes started! You can close this window.
pause
