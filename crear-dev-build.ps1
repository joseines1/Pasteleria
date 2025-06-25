# 🚀 Script para crear Development Build con Push Notifications Reales
# Autor: Asistente IA
# Fecha: 2024

Write-Host "🚀 CREANDO DEVELOPMENT BUILD PARA PUSH NOTIFICATIONS REALES" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""

# Verificar directorio actual
$currentDir = Get-Location
Write-Host "📁 Directorio actual: $currentDir" -ForegroundColor Cyan

# Verificar archivos necesarios
if (-not (Test-Path "app.json")) {
    Write-Host "❌ No se encontró app.json. Asegúrate de estar en el directorio correcto." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "eas.json")) {
    Write-Host "❌ No se encontró eas.json. Asegúrate de estar en el directorio correcto." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos de configuración encontrados" -ForegroundColor Green

# Limpiar directorios problemáticos
Write-Host ""
Write-Host "🧹 Limpiando directorios que causan problemas..." -ForegroundColor Yellow

$dirsToClean = @("android", "ios", ".expo", "node_modules/.cache", "build")
foreach ($dir in $dirsToClean) {
    if (Test-Path $dir) {
        try {
            Remove-Item $dir -Recurse -Force -ErrorAction Stop
            Write-Host "✅ Eliminado: $dir" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ No se pudo eliminar: $dir (puede estar en uso)" -ForegroundColor Yellow
        }
    }
}

# Verificar autenticación EAS
Write-Host ""
Write-Host "🔐 Verificando autenticación EAS..." -ForegroundColor Yellow
try {
    $easUser = npx eas whoami 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Autenticado como: $easUser" -ForegroundColor Green
    } else {
        Write-Host "❌ No estás autenticado con EAS. Ejecuta: npx eas login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error verificando autenticación EAS" -ForegroundColor Red
    exit 1
}

# Mostrar información del proyecto
Write-Host ""
Write-Host "📊 Información del proyecto:" -ForegroundColor Cyan
try {
    npx eas project:info
} catch {
    Write-Host "⚠️ No se pudo obtener información del proyecto" -ForegroundColor Yellow
}

# Crear build de desarrollo
Write-Host ""
Write-Host "🏗️ Iniciando build de desarrollo para iOS..." -ForegroundColor Yellow
Write-Host "⏱️ Esto puede tomar 10-15 minutos" -ForegroundColor Cyan
Write-Host ""

# Opciones del usuario
Write-Host "Selecciona una opción:" -ForegroundColor Yellow
Write-Host "1. iOS Development Build (Recomendado)" -ForegroundColor White
Write-Host "2. Android Development Build" -ForegroundColor White  
Write-Host "3. Ambos (iOS + Android)" -ForegroundColor White
Write-Host "4. Ver builds existentes" -ForegroundColor White
Write-Host "5. Salir" -ForegroundColor White

$choice = Read-Host "Ingresa tu opción (1-5)"

switch ($choice) {
    "1" {
        Write-Host "🍎 Creando build para iOS..." -ForegroundColor Green
        npx eas build --platform ios --profile development --non-interactive
    }
    "2" {
        Write-Host "🤖 Creando build para Android..." -ForegroundColor Green  
        npx eas build --platform android --profile development --non-interactive
    }
    "3" {
        Write-Host "📱 Creando builds para iOS y Android..." -ForegroundColor Green
        npx eas build --platform all --profile development --non-interactive
    }
    "4" {
        Write-Host "📋 Builds existentes:" -ForegroundColor Cyan
        npx eas build:list
    }
    "5" {
        Write-Host "👋 Saliendo..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
        exit 1
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 ¡Build iniciado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📧 Recibirás un email cuando el build esté listo" -ForegroundColor Cyan
    Write-Host "🔗 También puedes monitorear en: https://expo.dev/accounts/ines69/projects" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📱 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Esperar email de confirmación" -ForegroundColor White
    Write-Host "2. Descargar archivo IPA/APK" -ForegroundColor White
    Write-Host "3. Instalar en dispositivo" -ForegroundColor White
    Write-Host "4. ¡Disfrutar push notifications reales!" -ForegroundColor White
    Write-Host ""
    Write-Host "🔍 Para ver el estado: npx eas build:list" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ El build falló. Revisa los logs arriba." -ForegroundColor Red
    Write-Host "💡 Soluciones comunes:" -ForegroundColor Yellow
    Write-Host "- Ejecutar como administrador" -ForegroundColor White
    Write-Host "- Verificar conexión a internet" -ForegroundColor White
    Write-Host "- Limpiar cache: npx eas build --clear-cache" -ForegroundColor White
} 