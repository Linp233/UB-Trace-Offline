param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectDir = $PSScriptRoot
$nodeCandidates = @((Join-Path $projectDir 'runtime/node.exe'))
$nodeExe = $nodeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $nodeExe) {
    $nodeCmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($nodeCmd) { $nodeExe = $nodeCmd.Source }
}
if (-not $nodeExe) { throw 'Node.js was not found. Install the official Node.js LTS, then run this launcher again.' }
$baseUrl = & $nodeExe (Join-Path $projectDir 'config.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Cannot load config.json. Fix the configuration and start again.' }
$baseUrl = $baseUrl.Trim()
function Get-TracingHealth {
    try { return Invoke-RestMethod -Uri ($baseUrl + '/api/health') -TimeoutSec 2 } catch { return $null }
}
$health = Get-TracingHealth
if ($health -and $health.app -eq 'tracing-offline') {
    $pidPath = Join-Path $projectDir 'data/server.pid'
    $ownedProcess = $null
    if (Test-Path -LiteralPath $pidPath) {
        $ownedPid = 0
        if ([int]::TryParse((Get-Content -LiteralPath $pidPath -Raw).Trim(), [ref]$ownedPid) -and $ownedPid -gt 0) {
            $ownedProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $ownedPid)
        }
    }
    $serverScript = Join-Path $projectDir 'server.mjs'
    if (-not $ownedProcess -or $ownedProcess.Name -ne 'node.exe' -or -not $ownedProcess.CommandLine -or -not $ownedProcess.CommandLine.Contains($serverScript)) {
        throw 'This port is already used by another Tracing Offline installation. Choose an unused port in config.json.'
    }
    if (-not $NoBrowser) { Start-Process $baseUrl }
    Write-Output ('Tracing Offline is already running at ' + $baseUrl)
    Write-Output 'Use the original launcher window or Stop-Tracing.cmd to stop it.'
    return
}
$dataDir = Join-Path $projectDir 'data'
$pidPath = Join-Path $dataDir 'server.pid'
$serverScript = Join-Path $projectDir 'server.mjs'
if (Test-Path -LiteralPath $pidPath) {
    $existingPid = 0
    if ([int]::TryParse((Get-Content -LiteralPath $pidPath -Raw).Trim(), [ref]$existingPid) -and $existingPid -gt 0) {
        $existingProcess = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $existingPid)
        if ($existingProcess -and $existingProcess.Name -eq 'node.exe' -and $existingProcess.CommandLine -and $existingProcess.CommandLine.Contains($serverScript)) {
            throw 'Tracing Offline is already running with another configuration. Run Stop-Tracing.cmd, then Start-Tracing.cmd to apply config.json.'
        }
    }
}
New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
$process = New-Object System.Diagnostics.Process
$process.StartInfo.FileName = $nodeExe
$process.StartInfo.Arguments = '"' + $serverScript + '" --managed-launcher'
$process.StartInfo.WorkingDirectory = $projectDir
$process.StartInfo.UseShellExecute = $false
# The child shares this console. Its stdin pipe also closes if this launcher is
# terminated without running finally, so it cannot leave a background server.
$process.StartInfo.RedirectStandardInput = $true
$started = $false
try {
    $started = $process.Start()
    if (-not $started) { throw 'Cannot start the local server.' }
    $process.Id | Set-Content -LiteralPath $pidPath
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        if ($process.HasExited) { throw 'Server could not start. Check the error printed above.' }
        $health = Get-TracingHealth
        if ($health -and $health.app -eq 'tracing-offline') { break }
    }
    if (-not $health -or $health.app -ne 'tracing-offline') { throw 'Local server did not become ready.' }
    if (-not $NoBrowser) { Start-Process $baseUrl }
    Write-Output ('Tracing Offline is ready at ' + $baseUrl)
    Write-Output 'Keep this window open while using the editor.'
    Write-Output 'Close this window or press Ctrl+C to stop the local server.'
    while (-not $process.WaitForExit(250)) { }
    Write-Output 'Tracing Offline stopped.'
} finally {
    if ($started) {
        try {
            $process.StandardInput.Close()
            if (-not $process.WaitForExit(3000)) { $process.Kill(); $process.WaitForExit() }
        } finally {
            # Remove only our own PID record, even if another launcher has started.
            if ((Test-Path -LiteralPath $pidPath) -and (Get-Content -LiteralPath $pidPath -Raw).Trim() -eq [string]$process.Id) {
                Remove-Item -LiteralPath $pidPath
            }
        }
    }
    $process.Dispose()
}
