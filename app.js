// Cargar variables de entorno
require('dotenv').config();

// Verificación de variables críticas para Heroku
if (process.env.NODE_ENV === 'production') {
  console.log('🔧 Configuración de producción detectada');
  console.log('🔑 JWT_SECRET configurado:', !!process.env.JWT_SECRET);
  console.log('🌐 CORS_ORIGIN configurado:', !!process.env.CORS_ORIGIN);
}

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuración de CORS simplificada
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));

// Middleware de seguridad para producción
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
  
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Ruta raíz
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Pastelería funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check para el hosting
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Endpoint de prueba
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Servidor funcionando correctamente', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        jwt_configured: !!process.env.JWT_SECRET,
        cors_configured: !!process.env.CORS_ORIGIN
    });
});

// Endpoint de login básico para pruebas
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Credenciales de prueba
    if (email === 'admin@test.com' && password === '123456') {
        res.json({
            success: true,
            message: 'Login exitoso',
            user: { email, role: 'admin' },
            token: 'test-token-12345'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
        });
    }
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API Básica de Pastelería iniciada correctamente`);
}); 