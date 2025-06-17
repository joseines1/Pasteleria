const db = require('../models/db');

async function createUsersTable() {
    try {
        console.log('Creando tabla de usuarios...');
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )
        `;
        
        await db.execute(createTableQuery);
        console.log('✅ Tabla de usuarios creada exitosamente');
        
        // Verificar que la tabla se creó correctamente
        const tableInfo = await db.execute("PRAGMA table_info(usuarios)");
        console.log('Estructura de la tabla usuarios:', tableInfo.rows);
        
    } catch (error) {
        console.error('❌ Error al crear la tabla de usuarios:', error);
    }
}

createUsersTable(); 