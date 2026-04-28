# MxInspector build script
# Produces Chromium and Firefox builds from the single src/ tree.
#
# Usage (from repo root):
#   .\build.ps1
#
# Output:
#   releases\mendix-inspector-v<version>-beta-chromium.zip  (Chrome / Edge / any Chromium-based browser)
#   releases\mendix-inspector-v<version>-beta-firefox.zip   (Firefox 128+)
#
# How it works:
#   src\manifest.json          — Chromium manifest (service_worker background)
#   src\manifest.firefox.json  — Firefox manifest (event-page scripts background, gecko ID)
#   All other files are shared between the two builds.
#
# Chromium build: copy src\ → dist-chromium\, delete manifest.firefox.json, zip.
# Firefox build:  copy src\ → dist-firefox\, rename manifest.firefox.json → manifest.json
#                 (overwriting the Chromium one), zip.

$ErrorActionPreference = "Stop"

# Read version from Chromium manifest (the source of truth).
$Manifest = Get-Content "src\manifest.json" -Raw | ConvertFrom-Json
$Version  = $Manifest.version

Write-Host "Building MxInspector v$Version" -ForegroundColor Cyan

# Ensure releases folder exists.
if (-not (Test-Path "releases")) { New-Item -ItemType Directory -Path "releases" | Out-Null }

# --------------------------------------------------------------- Chromium build
Write-Host "  → Chromium..." -NoNewline
Remove-Item "dist-chromium" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "src" "dist-chromium" -Recurse
# Strip the Firefox manifest from the Chromium build — Chrome would just ignore
# it but keeping the build folder clean avoids confusion when sideloading
# unpacked.
Remove-Item "dist-chromium\manifest.firefox.json" -ErrorAction SilentlyContinue

$ChromiumZip = "releases\mendix-inspector-v$Version-beta-chromium.zip"
Remove-Item $ChromiumZip -ErrorAction SilentlyContinue
Compress-Archive -Path "dist-chromium\*" -DestinationPath $ChromiumZip
Write-Host " ok ($ChromiumZip)" -ForegroundColor Green

# --------------------------------------------------------------- Firefox build
Write-Host "  → Firefox..." -NoNewline
Remove-Item "dist-firefox" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "src" "dist-firefox" -Recurse
# Swap manifests: Firefox manifest becomes manifest.json, the Chromium one is
# discarded for this build.
Remove-Item "dist-firefox\manifest.json"
Move-Item "dist-firefox\manifest.firefox.json" "dist-firefox\manifest.json"

$FirefoxZip = "releases\mendix-inspector-v$Version-beta-firefox.zip"
Remove-Item $FirefoxZip -ErrorAction SilentlyContinue
Compress-Archive -Path "dist-firefox\*" -DestinationPath $FirefoxZip
Write-Host " ok ($FirefoxZip)" -ForegroundColor Green

# ----------------------------------------------------------------- Summary
Write-Host ""
Write-Host "Done. Output:" -ForegroundColor Cyan
Get-Item $ChromiumZip, $FirefoxZip | Format-Table Name, @{Name="Size (KB)"; Expression={[math]::Round($_.Length/1KB)}}, LastWriteTime -AutoSize