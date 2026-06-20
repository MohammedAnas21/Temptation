param(
  [string]$BuildId = $null
)

$projectRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$downloadsDir = Join-Path $projectRoot "downloads"
$apkPath = Join-Path $downloadsDir "temptations-cafe.apk"

if (-not $BuildId) {
  Write-Host "Downloading latest APK build..."
  & eas build:download --platform android --output $apkPath 2>&1
} else {
  Write-Host "Downloading build $BuildId ..."
  & eas build:download --id $BuildId --output $apkPath 2>&1
}

if ($LASTEXITCODE -eq 0 -and (Test-Path $apkPath)) {
  $size = (Get-Item $apkPath).Length
  Write-Host "APK downloaded to: $apkPath ($([math]::Round($size/1MB, 2)) MB)" -ForegroundColor Green
} else {
  Write-Host "Download failed. Check build status with: eas build:list" -ForegroundColor Red
}
