# ==============================================================================
# Questly — Microservices Orchestrator (Windows PowerShell)
# ==============================================================================
# Automates the startup, shutdown, and health monitoring of all Questly services.
# Uses optimized profiles, explicit port polling, and PID-based process management.
# ==============================================================================

param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet('start', 'stop', 'status', 'restart')]
    [string]$Action,

    [Parameter(Position = 1, Mandatory = $false)]
    [ValidateSet('infra', 'core', 'dev', 'all')]
    [string]$Profile = 'core'
)

$ErrorActionPreference = 'Stop'

# Port Registry
$Services = @(
    @{ name = 'config-server';         port = 8888; folder = 'services/config-server' },
    @{ name = 'discovery-server';      port = 8761; folder = 'services/discovery-server' },
    @{ name = 'gateway';               port = 8080; folder = 'services/gateway' },
    @{ name = 'auth-service';          port = 8081; folder = 'services/auth-service' },
    @{ name = 'user-service';          port = 8082; folder = 'services/user-service' },
    @{ name = 'notebook-service';      port = 8083; folder = 'services/notebook-service' },
    @{ name = 'quiz-service';          port = 8084; folder = 'services/quiz-service' },
    @{ name = 'flashcard-service';     port = 8085; folder = 'services/flashcard-service' },
    @{ name = 'course-service';        port = 8086; folder = 'services/course-service' },
    @{ name = 'assignment-service';    port = 8087; folder = 'services/assignment-service' },
    @{ name = 'practice-service';      port = 8088; folder = 'services/practice-service' },
    @{ name = 'ai-service';            port = 8089; folder = 'services/ai-service' },
    @{ name = 'gamification-service';  port = 8090; folder = 'services/gamification-service' },
    @{ name = 'analytics-service';     port = 8091; folder = 'services/analytics-service' },
    @{ name = 'notification-service';  port = 8092; folder = 'services/notification-service' }
)

$LogsDir = Join-Path $PSScriptRoot 'services/logs'

# Ensure Logs Directory Exists
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

# Helper: Test if Port is Listening
function Test-PortListening {
    param([int]$Port)
    $tc = New-Object System.Net.Sockets.TcpClient
    try {
        $tc.Connect('127.0.0.1', $Port)
        return $true
    } catch {
        return $false
    } finally {
        if ($tc) { $tc.Close() }
    }
}

# Helper: Poll Port with Timeout
function Wait-ForPort {
    param(
        [string]$ServiceName,
        [int]$Port,
        [int]$TimeoutSeconds = 60,
        [int]$IntervalSeconds = 2
    )
    Write-Host "  - Waiting for $ServiceName to bind to port $Port (timeout: ${TimeoutSeconds}s)..." -NoNewline
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-PortListening -Port $Port) {
            Write-Host ' [ONLINE]' -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds $IntervalSeconds
        $elapsed += $IntervalSeconds
    }
    Write-Host ' [FAILED]' -ForegroundColor Red
    return $false
}

# Helper: Get Running Process from PID File
function Get-ServiceProcess {
    param([string]$ServiceName)
    $pidFile = Join-Path $LogsDir "$ServiceName.pid"
    
    # 1. Try reading the PID file
    if (Test-Path $pidFile) {
        $pidVal = Get-Content $pidFile -Raw | Out-String
        $parsedPid = 0
        if ([int]::TryParse($pidVal.Trim(), [ref]$parsedPid)) {
            $proc = Get-Process -Id $parsedPid -ErrorAction SilentlyContinue
            if ($proc) {
                return $proc
            }
        }
    }
    
    # 2. Resilient Fallback: Query active java.exe command-lines (self-heals launcher PID differences on Windows)
    $procList = Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" -ErrorAction SilentlyContinue
    if ($procList) {
        foreach ($p in $procList) {
            if ($p.CommandLine -and $p.CommandLine.Contains("$ServiceName-1.0.0.jar")) {
                $proc = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
                if ($proc) {
                    # Auto-heal the PID file with the real runtime Java process ID
                    $proc.Id | Out-File -FilePath $pidFile -NoNewline -Encoding ascii
                    return $proc
                }
            }
        }
    }
    return $null
}

# Helper: Stop Service By PID File
function Stop-ServiceProcess {
    param([string]$ServiceName)
    $pidFile = Join-Path $LogsDir "$ServiceName.pid"
    $proc = Get-ServiceProcess -ServiceName $ServiceName
    if ($proc) {
        Write-Host "  - Stopping $ServiceName (PID: $($proc.Id))..." -NoNewline
        try {
            Stop-Process -Id $proc.Id -Force
            Write-Host ' [STOPPED]' -ForegroundColor Green
        } catch {
            Write-Host ' [ERROR]' -ForegroundColor Red
        }
    }
    if (Test-Path $pidFile) {
        Remove-Item $pidFile -Force
    }
}

# Action: STATUS
function Show-Status {
    Write-Host ''
    Write-Host 'Questly Service Topology & Runtime Status' -ForegroundColor Cyan
    Write-Host '==========================================================' -ForegroundColor Cyan
    
    $formatStr = '{0,-25} {1,-10} {2,-10} {3,-10}'
    Write-Host ($formatStr -f 'Service Name', 'Port', 'Status', 'PID') -ForegroundColor Yellow
    Write-Host '----------------------------------------------------------'
    
    foreach ($s in $Services) {
        $name = $s.name
        $port = $s.port
        $proc = Get-ServiceProcess -ServiceName $name
        $isListening = Test-PortListening -Port $port
        
        $status = 'OFFLINE'
        $color = 'DarkGray'
        $pidVal = '-'
        
        if ($proc -and $isListening) {
            $status = 'UP'
            $color = 'Green'
            $pidVal = $proc.Id
        } elseif ($proc) {
            $status = 'STARTING'
            $color = 'Yellow'
            $pidVal = $proc.Id
        } elseif ($isListening) {
            $status = 'CONFLICT'
            $color = 'Red'
            $pidVal = 'External'
        }
        
        Write-Host ($formatStr -f $name, $port, '', '') -NoNewline
        Write-Host ('{0,-10} {1,-10}' -f $status, $pidVal) -ForegroundColor $color
    }
    Write-Host '==========================================================' -ForegroundColor Cyan
    Write-Host ''
}

# Action: STOP
function Stop-AllServices {
    Write-Host ''
    Write-Host 'Gracefully terminating microservices stack...' -ForegroundColor Yellow
    Write-Host '==========================================================' -ForegroundColor Yellow
    
    # Terminate in reverse order (gateway -> discovery -> config)
    for ($i = $Services.Count - 1; $i -ge 0; $i--) {
        $s = $Services[$i]
        Stop-ServiceProcess -ServiceName $s.name
    }
    
    Write-Host '==========================================================' -ForegroundColor Green
    Write-Host ''
}

# Action: START
function Start-Services {
    param([string]$Profile)
    
    Write-Host ''
    Write-Host "Starting Questly stack with profile: '$Profile'..." -ForegroundColor Cyan
    Write-Host '==========================================================' -ForegroundColor Cyan

    # Determine Active Services based on Profile
    $activeNames = @()
    switch ($Profile) {
        'infra' {
            $activeNames = 'config-server', 'discovery-server', 'gateway'
        }
        'core' {
            $activeNames = 'config-server', 'discovery-server', 'gateway', 'auth-service', 'user-service', 'notebook-service', 'ai-service'
        }
        'dev' {
            $activeNames = 'config-server', 'discovery-server', 'gateway', 'auth-service', 'user-service', 'notebook-service', 'ai-service', 'quiz-service', 'flashcard-service'
        }
        'all' {
            $activeNames = $Services | ForEach-Object { $_.name }
        }
    }

    # Helper function to launch a jar
    $launchService = {
        param($s)
        $name = $s.name
        $folder = $s.folder
        $jarPath = "$folder/target/$name-1.0.0.jar"
        $pidFile = Join-Path $LogsDir "$name.pid"
        $logFile = Join-Path $LogsDir "$name.log"
        $errFile = Join-Path $LogsDir "$name-error.log"

        if (-not (Test-Path $jarPath)) {
            Write-Host "  - [ERROR] Compiled jar missing for $name! Run 'mvn clean install -DskipTests' first." -ForegroundColor Red
            return $false
        }

        # Check conflict
        if (Test-PortListening -Port $s.port) {
            $existing = Get-ServiceProcess -ServiceName $name
            if ($existing) {
                Write-Host "  - $name is already running on port $($s.port) (PID: $($existing.Id))." -ForegroundColor Yellow
                return $true
            } else {
                Write-Host "  - [ERROR] Port $($s.port) is already in use by an external application! Cannot start $name." -ForegroundColor Red
                return $false
            }
        }

        Write-Host "  - Bootstrapping $name on port $($s.port)..."
        
        # Start the java process directly on a single line with separated log and error outputs in a hidden background window
        $proc = Start-Process -FilePath 'java' -ArgumentList '-jar', "target/$name-1.0.0.jar" -WorkingDirectory $folder -WindowStyle Hidden -PassThru -RedirectStandardOutput $logFile -RedirectStandardError $errFile
        
        # Save PID
        $proc.Id | Out-File -FilePath $pidFile -NoNewline -Encoding ascii
        return $true
    }

    # --- 1. CONFIG SERVER ---
    $configSvc = $Services | Where-Object { $_.name -eq 'config-server' }
    if ($activeNames -contains 'config-server') {
        if (-not (& $launchService $configSvc)) { return }
        if (-not (Wait-ForPort -ServiceName 'config-server' -Port 8888)) {
            Write-Host ''
            Write-Host '[FATAL] Config Server failed to boot. Aborting stack startup.' -ForegroundColor Red
            return
        }
    }

    # --- 2. DISCOVERY SERVER ---
    $discoverySvc = $Services | Where-Object { $_.name -eq 'discovery-server' }
    if ($activeNames -contains 'discovery-server') {
        if (-not (& $launchService $discoverySvc)) { return }
        if (-not (Wait-ForPort -ServiceName 'discovery-server' -Port 8761)) {
            Write-Host ''
            Write-Host '[FATAL] Discovery Server failed to boot. Aborting stack startup.' -ForegroundColor Red
            return
        }
    }

    # --- 3. API GATEWAY ---
    $gatewaySvc = $Services | Where-Object { $_.name -eq 'gateway' }
    if ($activeNames -contains 'gateway') {
        if (-not (& $launchService $gatewaySvc)) { return }
        if (-not (Wait-ForPort -ServiceName 'gateway' -Port 8080)) {
            Write-Host ''
            Write-Host '[FATAL] API Gateway failed to boot. Aborting stack startup.' -ForegroundColor Red
            return
        }
    }

    # --- 4. DOMAIN SERVICES (Started in parallel with 1s stagger to prevent CPU thrashing) ---
    $domainServices = $Services | Where-Object { $_.name -notmatch 'config-server|discovery-server|gateway' -and $activeNames -contains $_.name }
    if ($domainServices) {
        Write-Host ''
        Write-Host 'Spawning domain services...' -ForegroundColor Yellow
        foreach ($s in $domainServices) {
            $launched = & $launchService $s
            if ($launched) {
                # Stagger startup slightly
                Start-Sleep -Milliseconds 1000
            }
        }
    }

    Write-Host ''
    Write-Host '==========================================' -ForegroundColor Green
    Write-Host 'Services triggered. Check log files in services/logs/ for outputs.' -ForegroundColor Green
    Write-Host "Run './run-services.ps1 status' to monitor startup progress." -ForegroundColor Green
    Write-Host '==========================================' -ForegroundColor Green
    Write-Host ''
}

# Main Execution Switch
switch ($Action) {
    'start' {
        Start-Services -Profile $Profile
    }
    'stop' {
        Stop-AllServices
    }
    'status' {
        Show-Status
    }
    'restart' {
        Stop-AllServices
        Start-Services -Profile $Profile
    }
}
