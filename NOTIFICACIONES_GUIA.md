# 🔔 Guía de Notificaciones Push - Pastelería App

## ✅ **Sistema Configurado y Funcionando**

¡Tu sistema de notificaciones está completamente configurado! Los empleados y administradores recibirán notificaciones automáticamente cuando ocurran cambios.

---

## 📱 **Cómo Funciona**

### **Flujo de Notificaciones:**
1. **Usuario inicia sesión** → Se genera y registra un push token automáticamente
2. **Empleado hace cambios** → Backend detecta la acción y obtiene tokens de administradores
3. **Notificación enviada** → Expo envía la notificación a todos los dispositivos registrados
4. **Administrador recibe notificación** → Ve el cambio en tiempo real

### **Tipos de Notificaciones:**
- 📦 **Ingredientes**: Crear, editar, eliminar
- 🍰 **Postres**: Crear, editar, eliminar  
- 🔗 **Recetas**: Crear, editar, eliminar relaciones postre-ingrediente

---

## 🚀 **Cómo Probar las Notificaciones**

### **Opción 1: Con Dos Dispositivos**
1. **Dispositivo 1**: Login como `admin@pasteleria.com` / `admin123`
2. **Dispositivo 2**: Login como empleado (cualquier otro usuario)
3. **En Dispositivo 2**: Crear/editar/eliminar ingredientes o postres
4. **En Dispositivo 1**: Recibir notificación instantánea ✨

### **Opción 2: Con Un Solo Dispositivo**
1. **Login como admin** y deja la app abierta
2. **Usa Postman/Navegador** para hacer cambios vía API:
   ```bash
   # Crear ingrediente
   POST https://pasteleria-c6865951d4d7.herokuapp.com/ingredientes
   Headers: Authorization: Bearer TU_TOKEN
   Body: {"nombreIngrediente": "Chocolate Nuevo", "existencias": 50}
   ```
3. **Recibe notificación** en tu dispositivo

### **Opción 3: Desde la Web API**
Puedes usar la terminal para crear cambios que generen notificaciones:
```bash
cd domingo
node test-receta.js
```

---

## 📋 **Credenciales de Prueba**

```
👤 Admin:     admin@pasteleria.com / admin123
👤 Empleado:  Crea tu propio usuario en la app
```

---

## 🔧 **Configuración Técnica Implementada**

### **Backend (ya configurado):**
- ✅ Expo Server SDK instalado
- ✅ Push notifications integradas en controladores
- ✅ Endpoint `/auth/push-token` para registro de tokens
- ✅ Servicio `PushNotificationService` funcional
- ✅ Notificaciones automáticas en todas las operaciones CRUD

### **App Móvil (ya configurado):**
- ✅ `expo-notifications` instalado
- ✅ Servicio `notificationService.js` creado
- ✅ Integración automática en `AuthContext`
- ✅ Configuración en `app.json` completa
- ✅ Listeners de notificaciones activos

---

## 📲 **Estados de Notificación**

| Estado | Descripción |
|--------|-------------|
| 🟢 **Activo** | Usuario logueado, token registrado, recibe notificaciones |
| 🟡 **Pendiente** | App en segundo plano, notificaciones llegan al sistema |
| 🔴 **Inactivo** | Usuario deslogueado, no recibe notificaciones |

---

## 🛠️ **Resolución de Problemas**

### **No Recibo Notificaciones:**
1. ✅ Verifica que estés en un **dispositivo físico** (no simulador)
2. ✅ Confirma que diste **permisos de notificación**
3. ✅ Asegúrate de estar **logueado como administrador**
4. ✅ Revisa que otros usuarios estén haciendo cambios

### **Consola de Debug:**
Abre React Native Debugger para ver logs como:
```
🔔 Token de notificación obtenido: ExponentPushToken[...]
📤 Enviando token al servidor: ...
✅ Token enviado al servidor exitosamente
🔔 Notificación recibida: {...}
```

### **Verificar desde Backend:**
```bash
# Logs en Heroku
heroku logs --tail -a pasteleria-c6865951d4d7

# Buscar mensajes como:
# ✅ Notificaciones enviadas exitosamente: 1
# 📧 Título: 📦 Nuevo Ingrediente Registrado
```

---

## 🎯 **Flujo Completo de Trabajo**

### **Escenario: Empleado Agrega Ingrediente**

1. **Empleado (José)** abre la app móvil
2. **Se loguea** → Su token se registra automáticamente
3. **Va a Ingredientes** → Presiona "Agregar"
4. **Completa formulario** → "Vainilla", 25 unidades
5. **Presiona Guardar** → API recibe petición POST

**Backend ejecuta:**
```javascript
// 1. Crear ingrediente en BD
const nuevoIngrediente = await Ingrediente.createIngrediente(...)

// 2. Enviar notificación
await PushNotificationService.notifyIngredienteCreated({
    id: nuevoIngrediente.id,
    nombre: "Vainilla"
}, "José");
```

6. **Administradores conectados** reciben:
   ```
   📦 Nuevo Ingrediente Registrado
   José agregó: Vainilla
   ```

---

## 📈 **Métricas de Notificaciones**

El sistema registra automáticamente:
- ✅ Notificaciones enviadas exitosamente
- ❌ Errores de envío (tokens inválidos)
- 📊 Total de tokens registrados
- ⏰ Timestamp de cada notificación

---

## 🔒 **Seguridad**

- 🔐 Solo usuarios autenticados pueden registrar tokens
- 🎯 Solo administradores reciben notificaciones de cambios
- 🚫 Tokens se validan antes de cada envío
- 🧹 Limpieza automática de tokens inválidos

---

## 🚀 **¡Listo para Usar!**

Tu sistema de notificaciones está **100% funcional**. Solo necesitas:

1. **Abrir la app en tu dispositivo físico**
2. **Hacer login como administrador**
3. **Permitir notificaciones cuando se solicite**
4. **Crear/editar items desde otra cuenta o API**
5. **¡Recibir notificaciones en tiempo real!** 🎉

---

*¿Tienes problemas? Revisa los logs en la consola o verifica la conexión de red.* 