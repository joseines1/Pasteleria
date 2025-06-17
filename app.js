// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const ingredientesRouter = require('./routes/ingredientes');
const postresRouter = require('./routes/postres');
const postresIngredientesRouter = require('./routes/postresIngredientes');
const authRouter = require('./routes/auth');
const notificationsRouter = require('./routes/notifications');
const testRouter = require('./routes/test');
const { authenticateToken } = require('./middleware/auth');
const cors = require('cors');
const path = require('path');

const app = express();

// Configuración de CORS para producción
const corsOptions = {
  origin: function (origin, callback) {
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En producción, usar origins específicos
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['https://tu-dominio.com']; // Valor por defecto
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));

// Middleware de seguridad para producción
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Confiar en el proxy del hosting
  
  // Headers de seguridad
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Servir archivos estáticos desde el directorio public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz que sirve el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rutas de autenticación (públicas)
app.use('/auth', authRouter);

// Rutas de test (incluye notificaciones de prueba)
app.use('/test', testRouter);

// En producción, activar autenticación para todas las rutas CRUD
if (process.env.NODE_ENV === 'production') {
  app.use('/ingredientes', authenticateToken, ingredientesRouter);
  app.use('/postres', authenticateToken, postresRouter);
  app.use('/postres-ingredientes', authenticateToken, postresIngredientesRouter);
} else {
  // En desarrollo, mantener sin autenticación para pruebas
  app.use('/ingredientes', ingredientesRouter);
  app.use('/postres', postresRouter);
  app.use('/postres-ingredientes', postresIngredientesRouter);
}

// Rutas de notificaciones (requieren autenticación de admin)
app.use('/notifications', notificationsRouter);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  } else {
    res.status(500).json({ 
      success: false, 
      message: err.message,
      stack: err.stack 
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 Interfaz web disponible en: http://localhost:${PORT}`);
  }
}); 