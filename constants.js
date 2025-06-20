// Configuración mejorada para producción y desarrollo
require('dotenv').config();

// Variables de entorno para producción en Heroku
const TURSO_SECRET_KEY = process.env.TURSO_SECRET_KEY || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDk4NjE3MDYsImlkIjoiMjVhYTJmODYtMGM4ZS00NzkyLTk4YzUtNjgzZGNhZjQ4NjY0IiwicmlkIjoiZjBmNGMxMmYtNTVkNC00MjI0LWI0MjEtNTU2Yjg1MmE2OGY0In0.gSxB3KPTbhdA1Qh8iWvR6ssRmcmT7DyVQo3vVNBuUk0YxQfIu2DWWV9LDr63DG3supNZtC4vBmTre3ELcaRVBg';

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || 'libsql://pasteleria-ines.aws-us-east-1.turso.io';

// JWT Secret más seguro para producción
const JWT_SECRET = process.env.JWT_SECRET || 'clave_super_segura_produccion_12345_cambiar_en_heroku';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const PORT = process.env.PORT || 3000;

// CORS Origins para producción
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://pasteleria-c6865951d4d7.herokuapp.com';

// Configuración de entorno
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log de configuración (solo para debug)
if (NODE_ENV === 'development') {
    console.log('🔧 Configuración cargada:');
    console.log('- NODE_ENV:', NODE_ENV);
    console.log('- PORT:', PORT);
    console.log('- TURSO_DATABASE_URL:', TURSO_DATABASE_URL ? '✅ Configurado' : '❌ No configurado');
    console.log('- TURSO_SECRET_KEY:', TURSO_SECRET_KEY ? '✅ Configurado' : '❌ No configurado');
    console.log('- JWT_SECRET:', JWT_SECRET ? '✅ Configurado' : '❌ No configurado');
    console.log('- CORS_ORIGIN:', CORS_ORIGIN);
}

module.exports = {
    TURSO_SECRET_KEY,
    TURSO_DATABASE_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    PORT,
    CORS_ORIGIN,
    NODE_ENV
};

