@echo off
setlocal
set "task_node="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined task_node set "task_node=%%N"
if not defined task_node if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "task_node=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined task_node (
 echo Node.js could not be found. Please open this project in Codex.
 pause
 exit /b 1
)
set "task_server=%~dp0preview-server.cjs"
powershell -NoProfile -Command "Start-Process -FilePath $env:task_node -ArgumentList ([char]34 + $env:task_server + [char]34), '--open' -WindowStyle Hidden"
endlocal
