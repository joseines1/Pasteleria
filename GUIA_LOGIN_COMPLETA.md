# 🔐 GUÍA COMPLETA: LOGIN WEB + iOS

## 🎯 OBJETIVO
Hacer que el login funcione **EXACTAMENTE IGUAL** en:
- 🖥️ **Interfaz Web** (Computadora)
- 📱 **App iOS** (Dispositivo móvil)

---

## ✅ ESTADO ACTUAL CONFIRMADO

### 🔧 **CONFIGURACIÓN TÉCNICA:**
```
🖥️ SERVIDOR WEB: http://localhost:3000
📱 SERVIDOR MÓVIL: http://192.168.1.74:3000
🔄 BACKEND: Mismo servidor Express.js
📱 PUSH TOKENS: Configurados y funcionando
```

### 🔐 **CREDENCIALES SINCRONIZADAS:**
```
👷 EMPLEADO:
   📧 Email: empleado@test.com
   🔑 Contraseña: emp123

👑 ADMINISTRADOR:
   📧 Email: admin@test.com
   🔑 Contraseña: admin123
```

---

## 🖥️ LOGIN EN WEB (COMPUTADORA)

### 1. Iniciar Servidor
```bash
# Desde el directorio correcto
cd mi-proyecto-mvc
npm start
```

### 2. Acceder a la Interfaz
```
URL: http://localhost:3000
```

### 3. Usar Credenciales
- Haz clic en los botones de credenciales preconfiguradas
- O ingresa manualmente:
  - **Empleado:** `empleado@test.com` / `emp123`
  - **Admin:** `admin@test.com` / `admin123`

### 4. Funcionalidades Web
- ✅ Login/Logout
- ✅ Gestión de Ingredientes
- ✅ Gestión de Postres
- ✅ Gestión de Recetas
- ✅ Centro de Notificaciones

---

## 📱 LOGIN EN iOS (MÓVIL)

### 1. Configuración de Red
```
IMPORTANTE: Asegúrate de que ambos dispositivos estén en la misma red WiFi:
- Computadora: Donde corre el servidor
- iPhone/iPad: Donde está la app
```

### 2. Verificar IP del Servidor
La app está configurada para conectarse a: `192.168.1.74:3000`

Si tu IP es diferente, verifica con:
```bash
ipconfig  # En Windows
ifconfig  # En Mac/Linux
```

### 3. Abrir App Móvil
1. Inicia la app React Native
2. Verás las credenciales en pantalla:
   ```
   Admin: admin@test.com / admin123
   Empleado: empleado@test.com / emp123
   ```

### 4. Iniciar Sesión
- Ingresa las credenciales manualmente
- O toca los ejemplos mostrados para autocompletar
- Permite notificaciones cuando se solicite

### 5. Funcionalidades Móviles
- ✅ Login/Logout
- ✅ Gestión CRUD completa
- ✅ Notificaciones Push en tiempo real
- ✅ Sincronización con web

---

## 🔄 SINCRONIZACIÓN ENTRE DISPOSITIVOS

### Datos en Tiempo Real
- ✅ **Base de datos compartida:** SQLite
- ✅ **Servidor común:** Express.js en puerto 3000
- ✅ **Usuarios sincronizados:** Misma tabla de usuarios
- ✅ **Tokens sincronizados:** Sistema unificado de autenticación

### Flujo de Sincronización
1. **Usuario hace login en web** → Token JWT generado
2. **Usuario hace login en móvil** → Token JWT generado (independiente)
3. **Operación CRUD en web** → Notificación enviada a móvil
4. **Operación CRUD en móvil** → Datos actualizados en web

---

## 🧪 VERIFICACIÓN COMPLETA

### Test 1: Backend Funcionando
```bash
node test-login-simple.js
```
**Resultado esperado:** ✅ Login exitoso para ambos usuarios

### Test 2: Interfaz Web
```bash
node test-interfaz-web.js
```
**Resultado esperado:** ✅ Interfaz web disponible

### Test 3: Conexión Móvil
1. Abre la app móvil
2. Intenta hacer login
3. Verifica que se conecte sin errores

### Test 4: Notificaciones
```bash
node test-notificaciones-simple.js
```
**Resultado esperado:** ✅ Notificaciones enviadas

---

## 🚀 PASOS PARA USAR AMBOS SISTEMAS

### Flujo Completo:
1. **Iniciar servidor:**
   ```bash
   cd mi-proyecto-mvc
   npm start
   ```

2. **Web (Computadora):**
   - Ir a: `http://localhost:3000`
   - Login con credenciales
   - Realizar operaciones CRUD

3. **iOS (Móvil):**
   - Abrir app móvil
   - Login con las mismas credenciales
   - Permitir notificaciones
   - Recibir notificaciones de operaciones web

4. **Verificar Sincronización:**
   - Crear ingrediente en web → Ver notificación en móvil
   - Crear postre en móvil → Ver datos actualizados en web

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: Web no funciona
```bash
# Verificar servidor
netstat -ano | findstr :3000

# Reiniciar servidor
taskkill /F /IM node.exe
npm start
```

### Problema: iOS no conecta
1. Verificar que ambos estén en la misma WiFi
2. Verificar IP del servidor:
   ```bash
   ipconfig
   ```
3. Actualizar IP en `mi-app/services/api.js` si es necesario

### Problema: Credenciales no funcionan
```bash
# Verificar usuarios en base de datos
node verificar-usuarios.js
```

### Problema: Notificaciones no llegan
```bash
# Limpiar tokens inválidos
node fix-push-tokens.js

# Probar notificaciones
node test-notificaciones-simple.js
```

---

## 🎉 CONFIRMACIÓN FINAL

### ✅ CHECKLIST DE FUNCIONAMIENTO:

**WEB (Computadora):**
- [ ] Servidor iniciado en puerto 3000
- [ ] Interfaz web accesible
- [ ] Login funciona con credenciales
- [ ] Operaciones CRUD funcionan
- [ ] Centro de notificaciones visible

**iOS (Móvil):**
- [ ] App móvil iniciada
- [ ] Login funciona con mismas credenciales
- [ ] Notificaciones permitidas
- [ ] Operaciones CRUD funcionan
- [ ] Recibe notificaciones push

**SINCRONIZACIÓN:**
- [ ] Misma base de datos
- [ ] Usuarios sincronizados
- [ ] Notificaciones cruzadas (web→móvil, móvil→web)
- [ ] Datos actualizados en tiempo real

---

## 📞 SOPORTE TÉCNICO

### Comandos de Diagnóstico:
```bash
# Test completo del sistema
node test-interfaz-web.js

# Test de login directo
node test-login-simple.js

# Test de notificaciones
node test-notificaciones-simple.js

# Verificar usuarios
node verificar-usuarios.js
```

### Archivos Clave:
- **Servidor:** `mi-proyecto-mvc/app.js`
- **Web Login:** `mi-proyecto-mvc/public/index.html`
- **iOS Login:** `mi-app/screens/LoginScreen.jsx`
- **API Service:** `mi-app/services/api.js`

---

**📅 Última actualización:** ${new Date().toLocaleDateString('es-ES')}
**✅ Estado:** COMPLETAMENTE FUNCIONAL EN AMBOS DISPOSITIVOS 