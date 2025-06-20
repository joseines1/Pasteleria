// Script para verificar configuración de Heroku
console.log('🔍 Verificando configuración de Heroku...\n');

console.log('📋 Variables de entorno:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NO CONFIGURADO');
console.log('PORT:', process.env.PORT || 'NO CONFIGURADO');  
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');
console.log('TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');
console.log('TURSO_SECRET_KEY:', process.env.TURSO_SECRET_KEY ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');

console.log('\n🗄️ Probando conexión a base de datos...');

const { createClient } = require('@libsql/client');

async function testDatabase() {
    try {
        const client = createClient({
            url: process.env.TURSO_DATABASE_URL || 'libsql://pasteleria-ines.aws-us-east-1.turso.io',
            authToken: process.env.TURSO_SECRET_KEY || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDk4NjE3MDYsImlkIjoiMjVhYTJmODYtMGM4ZS00NzkyLTk4YzUtNjgzZGNhZjQ4NjY0IiwicmlkIjoiZjBmNGMxMmYtNTVkNC00MjI0LWI0MjEtNTU2Yjg1MmE2OGY0In0.gSxB3KPTbhdA1Qh8iWvR6ssRmcmT7DyVQo3vVNBuUk0YxQfIu2DWWV9LDr63DG3supNZtC4vBmTre3ELcaRVBg'
        });

        // Probar conexión simple
        const result = await client.execute('SELECT 1 as test');
        console.log('✅ Conexión a base de datos exitosa');
        
        // Verificar si existen las tablas
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('\n📋 Tablas encontradas:');
        if (tables.rows.length === 0) {
            console.log('❌ No hay tablas creadas');
        } else {
            tables.rows.forEach(row => {
                console.log(`  - ${row.name}`);
            });
        }
        
        // Verificar datos en tablas específicas
        try {
            const postres = await client.execute('SELECT COUNT(*) as count FROM postres');
            console.log(`📊 Postres en DB: ${postres.rows[0].count}`);
        } catch (err) {
            console.log('❌ Tabla postres no existe');
        }
        
        try {
            const ingredientes = await client.execute('SELECT COUNT(*) as count FROM ingredientes');
            console.log(`📊 Ingredientes en DB: ${ingredientes.rows[0].count}`);
        } catch (err) {
            console.log('❌ Tabla ingredientes no existe');
        }
        
    } catch (error) {
        console.error('❌ Error conectando a base de datos:', error.message);
    }
}

testDatabase(); 