const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());

// CORS manual simple
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: '🎂 API de Pastelería funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'success',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Pastelería API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Servidor funcionando perfectamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: process.env.PORT || 3000
  });
});

// Login básico
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@test.com' && password === '123456') {
    res.json({
      success: true,
      message: 'Login exitoso',
      user: { email, role: 'admin' },
      token: 'demo-token-12345'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Endpoint de ingredientes demo
app.get('/ingredientes', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, nombre: 'Harina', cantidad: 100, unidad: 'kg' },
      { id: 2, nombre: 'Azúcar', cantidad: 50, unidad: 'kg' },
      { id: 3, nombre: 'Huevos', cantidad: 200, unidad: 'unidades' }
    ]
  });
});

// Endpoint de postres demo
app.get('/postres', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, nombre: 'Torta de Chocolate', precio: 25.99, disponible: true },
      { id: 2, nombre: 'Cheesecake', precio: 18.50, disponible: true },
      { id: 3, nombre: 'Tiramisu', precio: 22.00, disponible: false }
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🎂 API de Pastelería lista!`);
  console.log(`📱 Endpoints disponibles:`);
  console.log(`   GET  / - Página principal`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /test - Test de funcionamiento`);
  console.log(`   POST /auth/login - Login demo`);
  console.log(`   GET  /ingredientes - Lista de ingredientes`);
  console.log(`   GET  /postres - Lista de postres`);
}); 