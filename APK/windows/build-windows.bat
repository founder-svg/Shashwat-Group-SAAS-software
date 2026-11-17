@echo off
echo ============================================================
echo   Building Shashwat Group Windows 10/11 Desktop Application
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node modules...
if not exist "node_modules\" (
    echo Installing electron builder dependencies...
    npm install
)

echo [2/3] Compiling Windows NSIS Installer with Desktop Shortcut...
npm run build:win

echo.
echo ============================================================
echo  Build Complete! 
echo  Output installer located in: APK\windows\dist-installer\
echo ============================================================
pause
