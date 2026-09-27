@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer, then open this launcher again.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 (
    echo Dependencies could not be installed. Check your internet connection.
    pause
    exit /b 1
  )
)
echo Starting Valley Railway. Keep this window open while playing.
call npm.cmd run dev -- --open
pause
