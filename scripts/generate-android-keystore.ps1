# Genera el keystore de producción para IRAV (ejecutar una sola vez).
# Luego configura los secretos en GitHub: Settings > Secrets and variables > Actions

$keystore = Join-Path $PSScriptRoot "..\irav-release.keystore"
$keytool = "keytool"

function Test-AsciiPassword {
  param([string]$Value, [string]$Name)
  if ([string]::IsNullOrWhiteSpace($Value)) {
    Write-Host "Error: falta la variable $Name." -ForegroundColor Red
    return $false
  }
  foreach ($ch in $Value.ToCharArray()) {
    if ([int][char]$ch -gt 127) {
      Write-Host "Error: $Name contiene caracteres no ASCII (ej. n, tildes, eñe)." -ForegroundColor Red
      Write-Host "Usa solo letras sin tilde, numeros y simbolos basicos (a-z, A-Z, 0-9, !@#...)." -ForegroundColor Yellow
      return $false
    }
  }
  return $true
}

if (-not (Test-AsciiPassword $env:IRAV_KEYSTORE_PASSWORD "IRAV_KEYSTORE_PASSWORD")) { goto Usage }
if (-not (Test-AsciiPassword $env:IRAV_KEY_PASSWORD "IRAV_KEY_PASSWORD")) { goto Usage }

Write-Host "Generando keystore de produccion en: $keystore"
Write-Host "Guarda las contrasenas que elijas; las necesitaras en GitHub Secrets."
Write-Host ""

& $keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore $keystore `
  -alias irav-release `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass $env:IRAV_KEYSTORE_PASSWORD `
  -keypass $env:IRAV_KEY_PASSWORD `
  -dname "CN=IRAV, OU=Mobile, O=IRAV, L=Unknown, ST=Unknown, C=CO"

if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "No se pudo crear el keystore. Revisa las contrasenas e intenta de nuevo." -ForegroundColor Red
  goto Usage
}

$bytes = [IO.File]::ReadAllBytes($keystore)
$base64 = [Convert]::ToBase64String($bytes)

Write-Host ""
Write-Host "=== Secretos para GitHub Actions ===" -ForegroundColor Green
Write-Host "ANDROID_KEYSTORE_BASE64 = (copia el valor base64 de abajo)"
Write-Host $base64
Write-Host ""
Write-Host "ANDROID_KEYSTORE_PASSWORD = $env:IRAV_KEYSTORE_PASSWORD"
Write-Host "ANDROID_KEY_ALIAS         = irav-release"
Write-Host "ANDROID_KEY_PASSWORD      = $env:IRAV_KEY_PASSWORD"
Write-Host ""
Write-Host "NO subas irav-release.keystore al repositorio."
exit 0

:Usage
Write-Host ""
Write-Host "Ejemplo de uso (solo contrasenas ASCII, sin tildes ni eñe):" -ForegroundColor Cyan
Write-Host '  $env:IRAV_KEYSTORE_PASSWORD="MiClaveSegura2026!"'
Write-Host '  $env:IRAV_KEY_PASSWORD="MiClaveSegura2026!"'
Write-Host "  .\scripts\generate-android-keystore.ps1"
exit 1
