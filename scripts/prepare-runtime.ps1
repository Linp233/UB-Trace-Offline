param([ValidatePattern('^v24\.[0-9]+\.[0-9]+$')][string]$Version = 'v24.21.0')
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stageBase = Join-Path $projectRoot '.release-build'
$stage = Join-Path $stageBase ('runtime-' + [guid]::NewGuid().ToString('N'))
$utf8 = New-Object System.Text.UTF8Encoding($false)
New-Item -ItemType Directory -Path $stage -Force | Out-Null
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    $name = 'node-' + $Version + '-win-x64.zip'
    $origin = 'https://nodejs.org/dist/' + $Version
    Invoke-WebRequest -UseBasicParsing -Uri ($origin + '/SHASUMS256.txt') -OutFile (Join-Path $stage 'SHASUMS256.txt')
    $line = @(Get-Content -LiteralPath (Join-Path $stage 'SHASUMS256.txt') | Where-Object { $_ -match ('\s+' + [regex]::Escape($name) + '$') })
    if ($line.Count -ne 1) { throw 'Expected one checksum entry for the official Windows x64 archive.' }
    $expected = ($line[0].Trim() -split '\s+')[0]
    $archive = Join-Path $stage $name
    Invoke-WebRequest -UseBasicParsing -Uri ($origin + '/' + $name) -OutFile $archive
    $actual = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expected) { throw 'Node.js archive checksum mismatch.' }
    Expand-Archive -LiteralPath $archive -DestinationPath (Join-Path $stage 'expanded')
    $unpacked = Join-Path (Join-Path $stage 'expanded') ([IO.Path]::GetFileNameWithoutExtension($name))
    $runtime = Join-Path $projectRoot 'runtime'
    New-Item -ItemType Directory -Path $runtime -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $unpacked 'node.exe') -Destination $runtime -Force
    Copy-Item -LiteralPath (Join-Path $unpacked 'LICENSE') -Destination $runtime -Force
    $provenance = [ordered]@{
        version = $Version
        platform = 'win32'
        arch = 'x64'
        archiveUrl = $origin + '/' + $name
        archiveSha256 = $actual
        executableSha256 = (Get-FileHash -LiteralPath (Join-Path $runtime 'node.exe') -Algorithm SHA256).Hash.ToLowerInvariant()
    }
    [IO.File]::WriteAllText((Join-Path $runtime 'PROVENANCE.json'), ($provenance | ConvertTo-Json) + "`n", $utf8)
    Write-Output ('Verified official Node.js ' + $Version + ' Windows x64 runtime.')
} finally {
    $resolvedStage = [IO.Path]::GetFullPath($stage)
    $allowedParent = [IO.Path]::GetFullPath($stageBase) + [IO.Path]::DirectorySeparatorChar
    if (-not $resolvedStage.StartsWith($allowedParent, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe staging cleanup path.' }
    if (Test-Path -LiteralPath $resolvedStage) { Remove-Item -LiteralPath $resolvedStage -Recurse -Force }
}
