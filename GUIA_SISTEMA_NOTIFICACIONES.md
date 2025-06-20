# 🔔 Sistema de Notificaciones - Pastelería App

## 📋 Descripción General

El sistema de notificaciones permite a empleados y administradores gestionar solicitudes de eliminación, modificación y notificaciones personalizadas. Los empleados pueden crear solicitudes que requieren aprobación de administradores.

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Archivos
```
mi-proyecto-mvc/
├── models/notification.js              # Modelo de datos
├── controllers/notificationsController.js  # Controlador principal
├── routes/notificationsRoutes.js       # Rutas API
├── scripts/create-notifications-table.js   # Script creación tabla
└── test-notifications-system.js        # Script de pruebas

pasteleria-app/
└── src/screens/NotificationsScreen.js  # Pantalla móvil
```

### 🗄️ Base de Datos

#### Tabla: `notifications`
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'info',  -- 'info', 'solicitud', 'aprobacion', 'rechazo', 'alerta'
    estado TEXT DEFAULT 'no_leida',     -- 'no_leida', 'leida', 'aprobada', 'rechazada'
    usuario_destinatario_id INTEGER,    -- null = para todos los del tipo
    tipo_usuario_destinatario TEXT,     -- 'administrador', 'empleado'
    usuario_solicitante_id INTEGER NOT NULL,
    usuario_solicitante_nombre TEXT NOT NULL,
    modulo TEXT NOT NULL,              -- 'ingredientes', 'postres', 'recetas', 'general'
    accion TEXT NOT NULL,              -- 'crear', 'actualizar', 'eliminar', 'solicitar_eliminar', etc.
    objeto_id INTEGER,
    objeto_nombre TEXT,
    datos_adicionales TEXT,            -- JSON con información extra
    requiere_aprobacion BOOLEAN DEFAULT FALSE,
    aprobada_por_id INTEGER,
    aprobada_por_nombre TEXT,
    fecha_aprobacion DATETIME,
    comentario_aprobacion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME               -- Fecha de expiración (opcional)
);
```

## 🚀 Funcionalidades Implementadas

### 1. 📊 Notificaciones por Usuario/Tipo
- **Específicas**: Para un usuario en particular
- **Por tipo**: Para todos los administradores o empleados
- **Combinadas**: El usuario recibe ambos tipos

### 2. 🗑️ Solicitudes de Eliminación
- Empleados pueden solicitar eliminar ingredientes/postres
- Administradores reciben notificación push
- Sistema de aprobación/rechazo

### 3. 📝 Solicitudes de Modificación
- Empleados pueden solicitar cambios
- Incluye datos del antes/después
- Historial de cambios solicitados

### 4. 💬 Notificaciones Personalizadas
- Solicitudes libres por módulo
- Datos adicionales flexibles
- Categorización personalizada

### 5. ✅ Sistema de Aprobaciones
- Aprobación/rechazo con comentarios
- Historial de decisiones
- Notificaciones de resultado

### 6. 📱 Push Notifications
- Envío automático a administradores
- Integración con Firebase/Expo

## 🔧 API Endpoints

### Base URL: `/api/notifications`

#### GET `/` - Obtener mis notificaciones
Combina notificaciones específicas del usuario y de su tipo.

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "titulo": "🗑️ Solicitud de Eliminación - Chocolate",
      "mensaje": "Juan solicita eliminar Chocolate del módulo de ingredientes",
      "tipo": "solicitud",
      "estado": "no_leida",
      "modulo": "ingredientes",
      "usuario_solicitante_nombre": "Juan Pérez",
      "requiere_aprobacion": true,
      "datos_adicionales": { "motivo": "Ingrediente vencido" },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### GET `/stats` - Estadísticas
```json
{
  "success": true,
  "stats": {
    "total": 15,
    "unread": 5,
    "pending": 3
  }
}
```

#### GET `/pending` - Solicitudes pendientes (solo admins)
```json
{
  "success": true,
  "pendingApprovals": [...]
}
```

#### PUT `/:id/read` - Marcar como leída
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

#### PUT `/:id/approve` - Aprobar/Rechazar (solo admins)
**Body:**
```json
{
  "action": "aprobada", // o "rechazada"
  "comment": "Solicitud aprobada por motivos válidos"
}
```

#### DELETE `/:id` - Eliminar notificación
Solo el destinatario específico puede eliminar.

#### POST `/custom` - Crear solicitud personalizada
**Body:**
```json
{
  "titulo": "Propuesta de Mejora",
  "mensaje": "Implementar sistema de descuentos",
  "modulo": "general",
  "datos_extra": {
    "categoria": "mejora",
    "prioridad": "media"
  }
}
```

## 🛠️ Integración con Módulos

### Ingredientes
```javascript
// En ingredientesController.js

// Solicitud de eliminación
POST /api/ingredientes/:id/request-delete
{
  "motivo": "Ingrediente vencido"
}

// Solicitud de modificación  
POST /api/ingredientes/:id/request-update
{
  "nombreIngrediente": "Nuevo nombre",
  "motivo": "Corrección de nombre"
}

// Solicitud personalizada
POST /api/ingredientes/custom-request
{
  "titulo": "Propuesta para ingredientes",
  "mensaje": "Descripción de la solicitud",
  "datos_extra": {}
}
```

### Postres
```javascript
// En postresController.js

// Solicitud de eliminación
POST /api/postres/:id/request-delete
{
  "motivo": "Postre discontinuado"
}

// Solicitud de modificación
POST /api/postres/:id/request-update  
{
  "nombrePostre": "Nuevo nombre",
  "motivo": "Actualización de receta"
}

// Solicitud personalizada
POST /api/postres/custom-request
{
  "titulo": "Propuesta para postres",
  "mensaje": "Descripción de la solicitud",
  "datos_extra": {}
}
```

## 📱 Interfaz Móvil

### Características de la Pantalla
- **Header con estadísticas**: Total, no leídas, pendientes
- **Lista de notificaciones**: Con colores por tipo y estado
- **Filtrado automático**: Por usuario y tipo
- **Acciones**: Marcar leída, eliminar, aprobar/rechazar
- **Modal de aprobación**: Para administradores
- **Creación de solicitudes**: Formulario integrado

### Colores por Tipo
- 🔵 **Info**: Azul (`#E2F3FF`)
- 🟡 **Solicitud**: Amarillo (`#FFF3CD`)
- 🟢 **Aprobación**: Verde (`#D4EDDA`)
- 🔴 **Rechazo**: Rojo (`#F8D7DA`)
- 🟠 **Alerta**: Naranja (`#FFE5CC`)

### Iconos por Tipo
- ℹ️ Info
- 📋 Solicitud
- ✅ Aprobación
- ❌ Rechazo
- ⚠️ Alerta

## 🔄 Flujo de Trabajo

### Para Empleados:
1. **Crear solicitud** (eliminación/modificación/personalizada)
2. **Recibir confirmación** de envío
3. **Recibir notificación** de resultado (aprobada/rechazada)
4. **Ver historial** de solicitudes

### Para Administradores:
1. **Recibir push notification** de nueva solicitud
2. **Ver detalles** en la app
3. **Aprobar/Rechazar** con comentarios
4. **Gestionar** solicitudes pendientes

## 🧪 Testing

### Script de Pruebas
```bash
node test-notifications-system.js
```

**Funcionalidades probadas:**
- ✅ Creación de solicitudes
- ✅ Notificaciones por usuario/tipo
- ✅ Sistema de aprobaciones
- ✅ Estadísticas
- ✅ Marcado como leída
- ✅ Push notifications

### Datos de Prueba
El script crea automáticamente:
- Solicitudes de eliminación
- Solicitudes de modificación
- Notificaciones personalizadas
- Estadísticas del sistema

## 🔧 Configuración

### Variables de Entorno
```bash
# Firebase (para push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Dependencias Backend
```json
{
  "dependencies": {
    "@libsql/client": "^0.4.0",
    "express": "^4.18.0",
    "jsonwebtoken": "^9.0.0"
  }
}
```

### Dependencias Frontend
```json
{
  "dependencies": {
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "expo-notifications": "~0.23.0"
  }
}
```

## 📈 Estadísticas y Métricas

### Tipos de Estadísticas
- **Total**: Todas las notificaciones del usuario
- **No leídas**: Pendientes de revisión
- **Pendientes**: Solicitudes que requieren aprobación (solo admins)
- **Aprobadas**: Solicitudes aprobadas
- **Rechazadas**: Solicitudes rechazadas

### Filtros Disponibles
- Por usuario específico
- Por tipo de usuario
- Por estado
- Por módulo
- Por fecha de creación

## 🚀 Despliegue

### Backend (Heroku)
1. Crear tabla de notificaciones
2. Configurar variables de entorno
3. Desplegar código actualizado

### Frontend (Expo/EAS)
1. Actualizar código de la app
2. Publicar update con EAS
3. Verificar funcionamiento en dispositivos

## 🔄 Actualizaciones Futuras

### Mejoras Propuestas
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Filtros avanzados en la interfaz
- [ ] Notificaciones por email
- [ ] Dashboard de administración web
- [ ] Plantillas de notificaciones
- [ ] Notificaciones programadas
- [ ] Integración con calendario
- [ ] Métricas avanzadas

### Escalabilidad
- [ ] Paginación de notificaciones
- [ ] Cache de notificaciones frecuentes
- [ ] Archivado automático de notificaciones antiguas
- [ ] Compresión de datos adicionales

## 📞 Soporte

### Errores Comunes
1. **Error de conexión**: Verificar URL de base de datos
2. **Token inválido**: Verificar autenticación JWT
3. **Permisos**: Verificar rol de usuario
4. **Push notifications**: Verificar configuración Firebase

### Logs de Debug
```javascript
// Activar logs detallados
console.log('DEBUG: Notification details', notification);
```

---

**✨ Sistema de Notificaciones v1.0**  
*Desarrollado para Pastelería App - Gestión completa de solicitudes y notificaciones* 