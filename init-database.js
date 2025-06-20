// Script para inicializar base de datos en Turso
const { createClient } = require('@libsql/client');

console.log('🗄️ Inicializando base de datos...\n');

async function initDatabase() {
    try {
        const client = createClient({
            url: process.env.TURSO_DATABASE_URL || 'libsql://pasteleria-ines.aws-us-east-1.turso.io',
            authToken: process.env.TURSO_SECRET_KEY || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDk4NjE3MDYsImlkIjoiMjVhYTJmODYtMGM4ZS00NzkyLTk4YzUtNjgzZGNhZjQ4NjY0IiwicmlkIjoiZjBmNGMxMmYtNTVkNC00MjI0LWI0MjEtNTU2Yjg1MmE2OGY0In0.gSxB3KPTbhdA1Qh8iWvR6ssRmcmT7DyVQo3vVNBuUk0YxQfIu2DWWV9LDr63DG3supNZtC4vBmTre3ELcaRVBg'
        });

        console.log('✅ Conectado a Turso');

        // 1. Crear tabla usuarios
        console.log('📋 Creando tabla usuarios...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                rol TEXT DEFAULT 'empleado',
                pushToken TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 2. Crear tabla postres  
        console.log('📋 Creando tabla postres...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS postres (
                idPostre INTEGER PRIMARY KEY AUTOINCREMENT,
                nombrePostre TEXT NOT NULL
            )
        `);
        
        // 3. Crear tabla ingredientes
        console.log('📋 Creando tabla ingredientes...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS ingredientes (
                idIngrediente INTEGER PRIMARY KEY AUTOINCREMENT,
                nombreIngrediente TEXT NOT NULL,
                existencias INTEGER DEFAULT 0
            )
        `);
        
        // 4. Crear tabla postres_ingredientes (relación muchos a muchos)
        console.log('📋 Creando tabla postres_ingredientes...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS postres_ingredientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                idPostre INTEGER,
                idIngrediente INTEGER,
                cantidad REAL DEFAULT 1,
                FOREIGN KEY (idPostre) REFERENCES postres(idPostre) ON DELETE CASCADE,
                FOREIGN KEY (idIngrediente) REFERENCES ingredientes(idIngrediente) ON DELETE CASCADE
            )
        `);

        // 5. Crear tabla password_resets
        console.log('📋 Creando tabla password_resets...');
        await client.execute(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                token TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('\n🎯 Insertando datos de prueba...');
        
        // Insertar usuario admin por defecto
        try {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            await client.execute(`
                INSERT OR IGNORE INTO usuarios (nombre, email, password, rol) 
                VALUES (?, ?, ?, ?)
            `, ['Administrador', 'admin@pasteleria.com', hashedPassword, 'admin']);
            
            console.log('👤 Usuario admin creado (admin@pasteleria.com / admin123)');
        } catch (err) {
            console.log('👤 Usuario admin ya existe');
        }
        
        // Insertar algunos postres de ejemplo
        try {
            await client.execute(`INSERT OR IGNORE INTO postres (nombrePostre) VALUES ('Torta de Chocolate')`);
            await client.execute(`INSERT OR IGNORE INTO postres (nombrePostre) VALUES ('Cheesecake')`);
            await client.execute(`INSERT OR IGNORE INTO postres (nombrePostre) VALUES ('Tiramisu')`);
            console.log('🍰 Postres de ejemplo creados');
        } catch (err) {
            console.log('🍰 Postres ya existen');
        }
        
        // Insertar algunos ingredientes de ejemplo
        try {
            await client.execute(`INSERT OR IGNORE INTO ingredientes (nombreIngrediente, existencias) VALUES ('Harina', 100)`);
            await client.execute(`INSERT OR IGNORE INTO ingredientes (nombreIngrediente, existencias) VALUES ('Azúcar', 50)`);
            await client.execute(`INSERT OR IGNORE INTO ingredientes (nombreIngrediente, existencias) VALUES ('Huevos', 24)`);
            await client.execute(`INSERT OR IGNORE INTO ingredientes (nombreIngrediente, existencias) VALUES ('Chocolate', 20)`);
            console.log('🥚 Ingredientes de ejemplo creados');
        } catch (err) {
            console.log('🥚 Ingredientes ya existen');
        }

        // Verificar las tablas creadas
        const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('\n✅ Tablas creadas exitosamente:');
        tables.rows.forEach(row => {
            console.log(`  - ${row.name}`);
        });

        console.log('\n🎉 Base de datos inicializada correctamente!');
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

initDatabase(); 