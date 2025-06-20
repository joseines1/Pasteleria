# 🔧 ARREGLAR API EN HEROKU - PASO A PASO

## 🚨 PROBLEMA IDENTIFICADO
Tu API en Heroku funciona parcialmente:
- ✅ `/health` funciona
- ❌ `/postres` e `/ingredientes` fallan
- **Causa**: Falta configurar variables de entorno en Heroku

## 📋 SOLUCIÓN PASO A PASO

### **PASO 1: Configurar Variables de Entorno**
Ejecuta estos comandos en tu terminal (uno por uno):

```bash
heroku config:set NODE_ENV=production --app pasteleria-c6865951d4d7

heroku config:set JWT_SECRET=clave_super_segura_produccion_pasteleria_2024_12345 --app pasteleria-c6865951d4d7

heroku config:set TURSO_DATABASE_URL=libsql://pasteleria-ines.aws-us-east-1.turso.io --app pasteleria-c6865951d4d7

heroku config:set TURSO_SECRET_KEY="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDk4NjE3MDYsImlkIjoiMjVhYTJmODYtMGM4ZS00NzkyLTk4YzUtNjgzZGNhZjQ4NjY0IiwicmlkIjoiZjBmNGMxMmYtNTVkNC00MjI0LWI0MjEtNTU2Yjg1MmE2OGY0In0.gSxB3KPTbhdA1Qh8iWvR6ssRmcmT7DyVQo3vVNBuUk0YxQfIu2DWWV9LDr63DG3supNZtC4vBmTre3ELcaRVBg" --app pasteleria-c6865951d4d7

heroku config:set CORS_ORIGIN=https://pasteleria-c6865951d4d7.herokuapp.com --app pasteleria-c6865951d4d7
```

### **PASO 2: Verificar Variables**
```bash
heroku config --app pasteleria-c6865951d4d7
```

### **PASO 3: Inicializar Base de Datos**
```bash
heroku run node init-database.js --app pasteleria-c6865951d4d7
```

### **PASO 4: Reiniciar Aplicación**
```bash
heroku restart --app pasteleria-c6865951d4d7
```

### **PASO 5: Verificar que Funciona**
```bash
# Probar endpoints
curl https://pasteleria-c6865951d4d7.herokuapp.com/health
curl https://pasteleria-c6865951d4d7.herokuapp.com/postres
curl https://pasteleria-c6865951d4d7.herokuapp.com/ingredientes
```

## ✅ RESULTADO ESPERADO

Después de seguir estos pasos, deberías ver:

**https://pasteleria-c6865951d4d7.herokuapp.com/postres**
```json
[
  {"idPostre":35,"nombrePostre":"Torta de Chocolate"},
  {"idPostre":36,"nombrePostre":"Cheesecake"},
  {"idPostre":37,"nombrePostre":"Tiramisu"}
]
```

**https://pasteleria-c6865951d4d7.herokuapp.com/ingredientes**
```json
[
  {"idIngrediente":1,"nombreIngrediente":"Harina","existencias":100},
  {"idIngrediente":2,"nombreIngrediente":"Azúcar","existencias":50},
  {"idIngrediente":3,"nombreIngrediente":"Huevos","existencias":24}
]
```

## 🔍 VERIFICAR LOGS (Si hay problemas)
```bash
heroku logs --tail --app pasteleria-c6865951d4d7
```

## 📱 ACTUALIZAR APP MÓVIL
Una vez que la API funcione, actualiza en tu app móvil:

**Archivo: `pasteleria-app/src/services/apiService.js`**
```javascript
const API_BASE_URL = 'https://pasteleria-c6865951d4d7.herokuapp.com';
```

## 🎯 DATOS DE PRUEBA DISPONIBLES

**Usuario Admin:**
- Email: `admin@pasteleria.com`
- Password: `admin123`

**Endpoint de Login:**
```bash
curl -X POST https://pasteleria-c6865951d4d7.herokuapp.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pasteleria.com","password":"admin123"}'
```

## 🚨 PROBLEMAS COMUNES

### Error: "Cannot GET /postres"
- **Causa**: Variables de entorno no configuradas
- **Solución**: Ejecutar PASO 1 y PASO 4

### Error de CORS
- **Causa**: CORS_ORIGIN no configurado
- **Solución**: Variable CORS_ORIGIN ya incluida en PASO 1

### Error de Base de Datos
- **Causa**: Tablas no inicializadas
- **Solución**: Ejecutar PASO 3

## ✅ CHECKLIST

- [ ] Variables de entorno configuradas (PASO 1)
- [ ] Variables verificadas (PASO 2)  
- [ ] Base de datos inicializada (PASO 3)
- [ ] Aplicación reiniciada (PASO 4)
- [ ] Endpoints probados (PASO 5)
- [ ] App móvil actualizada

**¡Tu API estará funcionando perfectamente! 🎉** 