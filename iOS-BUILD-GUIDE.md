# 🍎 Guía de Build para iOS - Pastelería App

Esta rama está específicamente configurada para builds de iOS con EAS (Expo Application Services).

## 📋 Prerequisitos

### 1. Cuenta de Apple Developer
```bash
# Opción 1: Cuenta Individual ($99/año)
# - Permite distribución en App Store
# - Builds para dispositivos físicos
# - Certificados de distribución

# Opción 2: Cuenta Empresarial ($299/año)
# - Distribución interna
# - Más dispositivos de testing
```

### 2. Herramientas Necesarias
```bash
# Verificar instalación de EAS CLI
npx eas --version

# Autenticarse con Expo
npx eas login

# Verificar autenticación
npx eas whoami
```

## 🚀 Comandos de Build

### Build Rápido (Recomendado)
```bash
# Build para testing en dispositivos
npm run build:ios:preview

# Build para desarrollo/simulador
npm run build:ios:dev

# Build para producción/App Store
npm run build:ios:prod
```

### Build Manual
```bash
# Preview (testing)
npx eas build --platform ios --profile preview

# Desarrollo
npx eas build --platform ios --profile development

# Producción
npx eas build --platform ios --profile production
```

## 📱 Tipos de Build

| Perfil | Uso | Instalación | Duración |
|--------|-----|-------------|----------|
| `development` | Desarrollo local con simulador | Solo simulador | ~5-10 min |
| `preview` | Testing en dispositivos físicos | TestFlight o instalación directa | ~10-15 min |
| `production` | App Store | App Store Connect | ~15-20 min |

## 🔧 Configuración de Esta Rama

### EAS Configuration (`eas.json`)
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release",
        "autoIncrement": true
      }
    }
  }
}
```

### iOS Configuration (`app.json`)
- Bundle ID: `com.pasteleria.app`
- Build Number: Auto-incremento habilitado
- Notificaciones Push: Configuradas
- Heroku SSL: Configurado para HTTPS

## 📦 Proceso de Instalación

### Opción 1: TestFlight (Recomendado)
1. Build con perfil `production`
2. Subir a App Store Connect
3. Distribuir via TestFlight
4. Invitar testers por email

### Opción 2: Instalación Directa
1. Build con perfil `preview`
2. Descargar archivo `.ipa`
3. Instalar con Xcode o herramientas de terceros
4. Confiar en certificado de developer

## 🐛 Solución de Problemas

### Error: Credenciales de Apple
```bash
# Problema: "Invalid username and password"
# Solución: Usar App-Specific Password
# 1. Ve a appleid.apple.com
# 2. Genera App-Specific Password
# 3. Usa esa contraseña en lugar de la normal
```

### Error: Certificados
```bash
# Limpiar credenciales y reintentar
npx eas credentials

# Ver credenciales actuales
npx eas credentials:list
```

### Error: Build Fallido
```bash
# Ver logs detallados
npx eas build:view [BUILD_ID]

# Verificar estado de builds
npm run build:status
```

## 📊 Monitoreo de Builds

```bash
# Ver todos los builds
npx eas build:list

# Ver build específico
npx eas build:view [BUILD_ID]

# Cancelar build en progreso
npx eas build:cancel [BUILD_ID]
```

## 🔄 Workflow Recomendado

1. **Desarrollo Local**
   ```bash
   npm run build:ios:dev
   ```

2. **Testing Interno**
   ```bash
   npm run build:ios:preview
   ```

3. **Distribución Beta**
   ```bash
   npm run build:ios:prod
   # Luego subir a TestFlight
   ```

## 📞 Contacto y Soporte

- **Logs de Build**: Disponibles en Expo Dashboard
- **Documentación**: [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- **Soporte**: [Expo Discord](https://chat.expo.dev)

## 🎯 Siguiente Pasos

1. Configurar cuenta de Apple Developer
2. Ejecutar primer build de testing
3. Configurar distribución automatizada
4. Establecer pipeline CI/CD (opcional)

---

*Esta guía está optimizada para la rama `feature/ios-build-setup` del proyecto Pastelería App.* 