@echo off
cd /d "%~dp0"
echo Starting FastCopy helper...
start "" "http://127.0.0.1:3210/Clipboard.html"
node helper\server.js
pause
