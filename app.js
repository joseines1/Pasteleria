const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(express.json());

// CORS manual
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: '🍰 Pastelería API funcionando correctamente!',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint funcionando',
    method: req.method,
    url: req.url
  });
});

// Importar rutas
const authRoutes = require('./routes/auth');
const postresRoutes = require('./routes/postres');
const ingredientesRoutes = require('./routes/ingredientes');
const postresIngredientesRoutes = require('./routes/postresIngredientes');
const notificationsRoutes = require('./routes/notificationsRoutes');

// Usar las rutas reales de Turso
app.use('/auth', authRoutes);
app.use('/postres', postresRoutes);
app.use('/ingredientes', ingredientesRoutes);
app.use('/postres-ingredientes', postresIngredientesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    method: req.method,
    url: req.originalUrl
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Accesible desde: http://192.168.1.74:${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});

module.exports = app;