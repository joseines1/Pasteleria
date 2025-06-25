# Guía: Build From GitHub - Expo Dashboard

## 📋 Estado Actual
- ✅ **Repositorio**: https://github.com/joseines1/Pasteleria.git
- ✅ **Rama actualizada**: `feature/ios-build-setup`
- ✅ **Proyecto Expo**: `@ines69/pasteleria-app`
- ✅ **Configuración iOS**: Lista para development build

## 🚀 Pasos para Build From GitHub

### 1. En Expo Dashboard
Estás en: https://expo.dev/accounts/ines69/projects/pasteleria-app/builds

1. **Hacer clic en "Build From GitHub"** (botón azul en la parte superior derecha)

### 2. Configuración del Build

#### **Git Repository**
```
Repository: joseines1/Pasteleria
Branch: feature/ios-build-setup
```

#### **Build Configuration**
```
Platform: iOS
Profile: development
Project root: pasteleria-app
```

⚠️ **IMPORTANTE**: El directorio raíz debe ser `pasteleria-app` porque tu app está en un subdirectorio

#### **Build Settings**
```
✅ Platform: iOS
✅ Profile: development (NO preview)
✅ Runtime version: 1.2.1
✅ Project root: pasteleria-app
```

### 3. Verificación de Archivos

El build buscará estos archivos en `pasteleria-app/`:
- ✅ `app.json` - Configurado
- ✅ `eas.json` - Configurado  
- ✅ `package.json` - Configurado
- ✅ `expo-dev-client` - Instalado

### 4. Configuraciones Clave

#### En `app.json`:
```json
{
  "expo": {
    "name": "Pastelería App",
    "slug": "pasteleria-app",
    "runtimeVersion": "1.2.1",
    "ios": {
      "bundleIdentifier": "com.ines69.pasteleria"
    }
  }
}
```

#### En `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    }
  }
}
```

## 🔧 Solución a Problemas Comunes

### Si el build falla:

1. **Error "Project not found"**
   - Verificar que `Project root` sea: `pasteleria-app`

2. **Error "Invalid configuration"**
   - Verificar que la rama `feature/ios-build-setup` existe
   - Confirmar que los archivos están en la ruta correcta

3. **Error "No development profile"**
   - Asegurar que el profile sea `development` (no `preview`)

## 📱 Después del Build Exitoso

1. **Descargar la app** desde Expo Dashboard
2. **Instalar en iPhone** usando TestFlight o instalación directa
3. **Configurar push notifications** con certificados iOS
4. **Probar notificaciones reales** (no más limitaciones de Expo Go)

## 🎯 Ventajas del Build desde GitHub

- ✅ **Automático**: No necesitas comandos locales
- ✅ **Sin problemas de permisos**: Se ejecuta en servidores de Expo
- ✅ **Historial completo**: Tracking de todos los builds
- ✅ **Fácil distribución**: Links directos para descargar

## 📞 Siguientes Pasos

Una vez que el build termine exitosamente:
1. Descargar e instalar la app
2. Configurar Firebase Cloud Messaging para iOS
3. Probar el sistema completo de notificaciones
4. Celebrar 🎉

---
**Nota**: Este build puede tomar 10-15 minutos. Puedes monitorear el progreso en tiempo real desde el dashboard. 