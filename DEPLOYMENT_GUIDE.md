# 🚀 Guía de Deployment: Subir API a Hosting

## 📋 Cambios Realizados para Producción

### ✅ Preparación Completada
- [x] Variables de entorno configuradas
- [x] CORS configurado para producción
- [x] Middleware de seguridad añadido
- [x] Autenticación activada en producción
- [x] Health check endpoint (`/health`)
- [x] Manejo de errores mejorado
- [x] Scripts de producción en package.json
- [x] .gitignore configurado
- [x] Procfile para Heroku creado

## 🌐 Opciones de Hosting Recomendadas

### 1. 🟣 **Heroku** (Más Fácil)
```bash
# 1. Instalar Heroku CLI
# Descargar desde: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login en Heroku
heroku login

# 3. Crear app en Heroku
heroku create tu-app-pasteleria

# 4. Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=clave_super_segura_12345
heroku config:set CORS_ORIGIN=https://tu-app-pasteleria.herokuapp.com

# 5. Subir código
git add .
git commit -m "Deploy inicial"
git push heroku main

# 6. Ver logs
heroku logs --tail
```

### 2. 🟦 **Railway** (Moderno y Fácil)
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login en Railway
railway login

# 3. Crear proyecto
railway new

# 4. Deployar
railway up

# 5. Configurar variables de entorno en dashboard
# Ir a: https://railway.app → Tu proyecto → Variables
```

### 3. 🟡 **Vercel** (Para APIs simples)
```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy
vercel

# 4. Configurar variables de entorno en dashboard
```

### 4. 🟢 **Render** (Gratuito con limitaciones)
1. Ve a https://render.com
2. Conecta tu repositorio de GitHub
3. Selecciona "Web Service"
4. Configura:
   - Build Command: `npm install`
   - Start Command: `npm start`

## 🔧 Variables de Entorno Requeridas

### Mínimas para Funcionamiento
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_12345678
```

### Completas (Recomendadas)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_12345678
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com
DATABASE_URL=sqlite:./database.db
EXPO_ACCESS_TOKEN=tu_expo_access_token_opcional
```

## 📱 Actualizar App Móvil

### Cambiar IP en la App
```javascript
// mi-app/services/api.js
const API_BASE_URL = 'https://tu-app-pasteleria.herokuapp.com'; // Nueva URL del hosting
```

### Pasos:
1. **Obtener URL del hosting** (ej: `https://tu-app.herokuapp.com`)
2. **Actualizar mi-app/services/api.js**:
   ```javascript
   const API_BASE_URL = 'https://tu-app.herokuapp.com';
   ```
3. **Probar conexión** desde la app móvil

## 🧪 Testing Post-Deployment

### 1. Verificar Servidor
```bash
# Health check
curl https://tu-app.herokuapp.com/health

# Test básico
curl https://tu-app.herokuapp.com/test
```

### 2. Probar Login
```bash
curl -X POST https://tu-app.herokuapp.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

### 3. Verificar CORS
```bash
curl -H "Origin: https://tu-dominio.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS https://tu-app.herokuapp.com/test
```

## 🗄️ Base de Datos en Producción

### SQLite (Simple)
- ✅ Ya configurado
- ⚠️ Se resetea en cada deploy en algunos hostings
- 💡 Bueno para pruebas

### PostgreSQL (Recomendado para producción)
```bash
# En Heroku
heroku addons:create heroku-postgresql:hobby-dev

# Instalar pg
npm install pg

# Actualizar código para usar PostgreSQL
```

## 🔐 Seguridad en Producción

### Variables de Entorno Importantes
```env
# JWT Secret - OBLIGATORIO cambiar
JWT_SECRET=clave_super_segura_de_al_menos_32_caracteres_12345

# CORS Origins - Dominios permitidos
CORS_ORIGIN=https://tu-dominio.com,https://www.tu-dominio.com

# Environment
NODE_ENV=production
```

### Headers de Seguridad (Ya configurados)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📋 Checklist Pre-Deploy

### Código
- [ ] Variables de entorno configuradas
- [ ] .env en .gitignore
- [ ] CORS configurado para tu dominio
- [ ] JWT_SECRET cambiado
- [ ] Base de datos preparada

### Hosting
- [ ] Servicio de hosting elegido
- [ ] Variables de entorno configuradas en hosting
- [ ] Dominio personalizado (opcional)
- [ ] SSL habilitado (automático en la mayoría)

### App Móvil
- [ ] URL actualizada en api.js
- [ ] CORS incluye la nueva URL
- [ ] Testing en dispositivos reales

## 🚨 Troubleshooting Común

### Error CORS
```
Access to fetch at 'https://tu-app.com' from origin 'null' has been blocked by CORS policy
```
**Solución**: Agregar tu dominio a `CORS_ORIGIN`

### Error 502 Bad Gateway
**Solución**: Verificar que el puerto sea `process.env.PORT || 3000`

### Base de datos no persiste
**Solución**: Cambiar a PostgreSQL o usar hosting con persistencia

### App móvil no conecta
**Solución**: 
1. Verificar URL en api.js
2. Probar endpoint desde navegador
3. Verificar CORS

## 📊 Monitoreo

### Logs en Vivo
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# Render
Ver dashboard web
```

### Métricas
- Response time < 500ms
- Uptime > 99%
- Error rate < 1%

## 💰 Costos Estimados

| Hosting | Gratis | Precio Mensual |
|---------|--------|----------------|
| Heroku | 550h/mes | $7+ |
| Railway | 500h/mes | $5+ |
| Render | 750h/mes | $7+ |
| Vercel | Ilimitado* | $20+ |

*Con limitaciones de tiempo de ejecución

## 🎯 Recomendación Final

### Para Principiantes: **Heroku**
- Más documentación
- Proceso simple
- Buenos addons

### Para Modernos: **Railway**
- Interface moderna
- Deploy automático
- Buenos precios

---

## 📞 Soporte Post-Deploy

Después del deploy:
1. **Probar todos los endpoints**
2. **Verificar notificaciones push**
3. **Actualizar documentación**
4. **Configurar monitoreo**

**¡Tu API estará lista para producción! 🚀** 