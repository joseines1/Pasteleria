const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Auth endpoint básico
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@test.com' && password === '123456') {
    res.json({
      success: true,
      message: 'Login exitoso',
      user: { email: 'admin@test.com', role: 'admin' },
      token: 'token_demo_12345'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Endpoints demo
app.get('/ingredientes', (req, res) => {
  res.json([
    { id: 1, nombre: 'Harina', stock: 100 },
    { id: 2, nombre: 'Azúcar', stock: 50 }
  ]);
});

app.get('/postres', (req, res) => {
  res.json([
    { id: 1, nombre: 'Torta de Chocolate', precio: 25.99 },
    { id: 2, nombre: 'Cheesecake', precio: 18.50 }
  ]);
});

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
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;