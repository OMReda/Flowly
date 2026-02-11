@echo off
TITLE Flowly AI Dev Server
echo ========================================
echo   FLOWLY AI - STARTUP UTILITY
echo ========================================
echo.
echo [1/3] Clearing process locks...
taskkill /F /IM node.exe /T >nul 2>&1
echo Local processes cleared.

echo.
echo [2/3] Cleaning build cache...
if exist .next (
    rmdir /s /q .next
    echo Cache cleared successfully.
) else (
    echo Cache already clean.
)
echo.
echo [3/3] Launching Next.js Dev Server...
echo.
npm run dev
pause
