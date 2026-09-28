$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$nodeExe = Join-Path $projectRoot 'runtime/node.exe'
if (-not (Test-Path -LiteralPath $nodeExe)) { throw 'Prepare the official runtime with scripts/prepare-runtime.ps1 first.' }
& $nodeExe (Join-Path $PSScriptRoot 'audit.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Source privacy audit failed.' }
& $nodeExe (Join-Path $PSScriptRoot 'validate.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Source validation failed.' }
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'VERSION') -Raw).Trim()
if ($version -notmatch '^\d+\.\d+(?:\.\d+)?$') { throw 'VERSION must contain a release number such as 0.1 or 0.1.1.' }
$packageName = 'Tracing-Offline-v' + $version + '-windows-x64'
$stageBase = Join-Path $projectRoot '.release-build'
$stage = Join-Path $stageBase ([guid]::NewGuid().ToString('N'))
$packageRoot = Join-Path $stage $packageName
$releases = Join-Path $projectRoot 'releases'
$utf8 = New-Object System.Text.UTF8Encoding($false)
New-Item -ItemType Directory -Path $packageRoot -Force | Out-Null
New-Item -ItemType Directory -Path $releases -Force | Out-Null
try {
    $files = @('VERSION','CHANGELOG.md','README.md','README.zh-CN.md','SCHEMA.md','LICENSE','THIRD-PARTY.md','LICENSE-STATUS.md','Start-Tracing.cmd','Start-Tracing.ps1','Stop-Tracing.cmd','Stop-Tracing.ps1','config.json','config.mjs','server.mjs')
    foreach ($name in $files) { Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination (Join-Path $packageRoot $name) }
    foreach ($name in @('dist','lib','tools','examples','licenses')) { Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination $packageRoot -Recurse }
    $runtime = Join-Path $packageRoot 'runtime'
    New-Item -ItemType Directory -Path $runtime | Out-Null
    foreach ($name in @('node.exe','LICENSE','PROVENANCE.json')) { Copy-Item -LiteralPath (Join-Path $projectRoot ('runtime/' + $name)) -Destination $runtime }
    & $nodeExe (Join-Path $PSScriptRoot 'audit.mjs') --package $packageRoot --manifest
    if ($LASTEXITCODE -ne 0) { throw 'Package privacy audit or runtime verification failed.' }
    $archive = Join-Path $releases ($packageName + '.zip')
    Compress-Archive -LiteralPath $packageRoot -DestinationPath $archive -CompressionLevel Optimal -Force
    $hash = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
    [IO.File]::WriteAllText(($archive + '.sha256'), ($hash + '  ' + $packageName + ".zip`n"), $utf8)
    Copy-Item -LiteralPath (Join-Path $packageRoot 'release-manifest.json') -Destination (Join-Path $releases ($packageName + '.manifest.json')) -Force
    Write-Output ('Created releases/' + $packageName + '.zip')
    Write-Output ('SHA256: ' + $hash)
} finally {
    $resolvedStage = [IO.Path]::GetFullPath($stage)
    $allowedParent = [IO.Path]::GetFullPath($stageBase) + [IO.Path]::DirectorySeparatorChar
    if (-not $resolvedStage.StartsWith($allowedParent, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe staging cleanup path.' }
    if (Test-Path -LiteralPath $resolvedStage) { Remove-Item -LiteralPath $resolvedStage -Recurse -Force }
}
