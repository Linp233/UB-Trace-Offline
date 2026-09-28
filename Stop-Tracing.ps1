$ErrorActionPreference = 'Stop'
$pidPath = Join-Path $PSScriptRoot 'data/server.pid'
if (Test-Path -LiteralPath $pidPath) {
    $serverPid = [int](Get-Content -LiteralPath $pidPath)
    $process = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $serverPid)
    $serverScript = Join-Path $PSScriptRoot 'server.mjs'
    if ($process -and $process.Name -eq 'node.exe' -and $process.CommandLine -and $process.CommandLine.Contains($serverScript)) {
        Stop-Process -Id $serverPid
        Write-Output 'Tracing Offline stopped.'
    } else { Write-Output 'No matching Tracing Offline process is running.' }
}
