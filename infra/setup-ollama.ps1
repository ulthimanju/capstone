# Script to configure local Ollama to be accessible from Docker containers on Windows
# Sets the OLLAMA_HOST environment variable to 0.0.0.0 and restarts Ollama.

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Configuring Ollama for Docker Container Access" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Stop running Ollama processes
Write-Host "`n[1/4] Stopping any running Ollama processes..." -ForegroundColor Yellow
$processes = Get-Process -Name "ollama app", "ollama" -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($p in $processes) {
        Write-Host "  - Stopping process: $($p.Name) (ID: $($p.Id))"
        Stop-Process -Id $p.Id -Force
    }
    # Wait for processes to exit
    Start-Sleep -Seconds 2
} else {
    Write-Host "  - No running Ollama processes found."
}

# 2. Set OLLAMA_HOST to 0.0.0.0 as a User Environment Variable
Write-Host "`n[2/4] Setting OLLAMA_HOST user environment variable..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable("OLLAMA_HOST", "0.0.0.0", "User")
$env:OLLAMA_HOST = "0.0.0.0" # Also set in current process session
Write-Host "  - OLLAMA_HOST successfully set to 0.0.0.0" -ForegroundColor Green

# 3. Locate and Restart Ollama
Write-Host "`n[3/4] Restarting Ollama..." -ForegroundColor Yellow
$ollamaFolder = "$env:LOCALAPPDATA\Programs\Ollama"
$ollamaAppPath = Join-Path $ollamaFolder "ollama app.exe"
$ollamaCliPath = Join-Path $ollamaFolder "ollama.exe"

if (Test-Path $ollamaAppPath) {
    Write-Host "  - Launching Ollama Tray Application..."
    Start-Process -FilePath $ollamaAppPath
} elseif (Test-Path $ollamaCliPath) {
    Write-Host "  - Launching Ollama CLI background server..."
    Start-Process -FilePath $ollamaCliPath -ArgumentList "serve" -WindowStyle Hidden
} else {
    # Fallback to system PATH
    Write-Host "  - Looking for ollama in system PATH..."
    $pathCmd = Get-Command ollama -ErrorAction SilentlyContinue
    if ($pathCmd) {
        $pathDir = Split-Path $pathCmd.Source
        $appFallback = Join-Path $pathDir "ollama app.exe"
        if (Test-Path $appFallback) {
            Write-Host "  - Launching Ollama Tray Application from path..."
            Start-Process -FilePath $appFallback
        } else {
            Write-Host "  - Launching Ollama CLI server from path..."
            Start-Process -FilePath $pathCmd.Source -ArgumentList "serve" -WindowStyle Hidden
        }
    } else {
        Write-Warning "Could not locate Ollama installation. Please start Ollama manually."
        return
    }
}

# 4. Verify binding
Write-Host "`n[4/4] Verifying network binding (waiting up to 10 seconds)..." -ForegroundColor Yellow
$verified = $false
for ($i = 1; $i -le 5; $i++) {
    Start-Sleep -Seconds 2
    $netstat = netstat -ano | findstr 11434
    if ($netstat -match "0.0.0.0:11434" -or $netstat -match "\[::\]:11434") {
        Write-Host "`n[SUCCESS] Ollama is now successfully listening on all interfaces (0.0.0.0:11434)!" -ForegroundColor Green
        Write-Host "Docker containers will now be able to connect to Ollama using host.docker.internal." -ForegroundColor Green
        $verified = $true
        break
    }
}

if (-not $verified) {
    Write-Warning "Ollama is starting up but we couldn't confirm the 0.0.0.0:11434 binding yet."
    Write-Warning "Please check running processes or run: netstat -ano | findstr 11434"
}

Write-Host "`n=============================================" -ForegroundColor Cyan
