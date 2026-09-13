@echo off
setlocal
cd /d "%~dp0"
set "GRACE_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "GRACE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "node_modules\vinext\dist\cli.js" (
  echo Dependencies are missing. See README.md for installation.
  pause
  exit /b 1
)
echo Grace Cosmetics: http://127.0.0.1:5173
echo Keep this window open. Press Ctrl+C to stop the site.
"%GRACE_NODE%" scripts\run-framework.mjs dev --hostname 127.0.0.1
if errorlevel 1 pause
