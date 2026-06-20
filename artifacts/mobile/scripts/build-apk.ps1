param(
  [string]$Profile = "preview"
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$downloadsDir = Join-Path $projectRoot "downloads"
$apkPath = Join-Path $downloadsDir "temptations-cafe.apk"

Write-Host "=== Temptations Cafe APK Builder ===" -ForegroundColor Cyan
Write-Host ""

# Check if logged into EAS
$whoami = & eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Not logged into Expo. Run 'eas login' first." -ForegroundColor Yellow
  Write-Host "  (Create a free account at https://expo.dev/signup)" -ForegroundColor Gray
  exit 1
}

Write-Host "Logged in as: $whoami" -ForegroundColor Green

# Run the build
Write-Host "`nStarting EAS build for Android (profile: $Profile)..." -ForegroundColor Cyan
Write-Host "  This will take 5-15 minutes. Expo's cloud servers handle compilation.`n" -ForegroundColor Gray

$buildOutput = & eas build -p android --profile $Profile --no-wait 2>&1
Write-Host $buildOutput

# Extract the build ID from output
$buildId = $null
if ($buildOutput -match 'https://expo\.dev/accounts/[^/]+/projects/[^/]+/builds/([^/\s]+)') {
  $buildId = $matches[1]
}

if ($buildId) {
  Write-Host "`nBuild submitted! Build ID: $buildId" -ForegroundColor Green
  Write-Host "Monitor at: https://expo.dev/builds/$buildId" -ForegroundColor Cyan
} else {
  Write-Host "`nBuild submitted. Check status with: eas build:list" -ForegroundColor Cyan
}
