const db = require('./models/db');

async function testTursoNotifications() {
    console.log('🔍 Probando conexión a Turso y tabla de notificaciones...');
    
    try {
        // 1. Verificar conexión básica
        console.log('\n1. 🔗 Verificando conexión a Turso...');
        const connectionTest = await db.execute('SELECT 1 as test');
        console.log('✅ Conexión a Turso exitosa');
        
        // 2. Verificar si existe la tabla notifications
        console.log('\n2. 📋 Verificando tabla notifications...');
        const tableExists = await db.execute(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='notifications'
        `);
        
        if (tableExists.rows.length === 0) {
            console.log('❌ La tabla notifications NO existe');
            console.log('🔧 Creando tabla notifications...');
            
            await db.execute(`
                CREATE TABLE notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo TEXT NOT NULL,
                    mensaje TEXT NOT NULL,
                    tipo TEXT NOT NULL DEFAULT 'info',
                    estado TEXT DEFAULT 'no_leida',
                    usuario_destinatario_id INTEGER,
                    tipo_usuario_destinatario TEXT,
                    usuario_solicitante_id INTEGER NOT NULL,
                    usuario_solicitante_nombre TEXT NOT NULL,
                    modulo TEXT NOT NULL,
                    accion TEXT NOT NULL,
                    objeto_id INTEGER,
                    objeto_nombre TEXT,
                    datos_adicionales TEXT,
                    requiere_aprobacion BOOLEAN DEFAULT FALSE,
                    aprobada_por_id INTEGER,
                    aprobada_por_nombre TEXT,
                    fecha_aprobacion DATETIME,
                    comentario_aprobacion TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME
                )
            `);
            console.log('✅ Tabla notifications creada');
            
            // Insertar datos de ejemplo
            console.log('📝 Insertando notificaciones de ejemplo...');
            await db.execute(`
                INSERT INTO notifications (
                    titulo, mensaje, tipo, tipo_usuario_destinatario,
                    usuario_solicitante_id, usuario_solicitante_nombre,
                    modulo, accion, objeto_nombre
                ) VALUES 
                ('🎉 Sistema de Notificaciones Activado', 
                 'El nuevo sistema de notificaciones ya está disponible.', 
                 'info', 'administrador', 1, 'Sistema', 'general', 'personalizada', 'Sistema'),
                ('🗑️ Solicitud de Eliminación', 
                 'Solicitud de eliminación de ingrediente pendiente de aprobación.', 
                 'solicitud', 'administrador', 2, 'Empleado Test', 'ingredientes', 'solicitar_eliminar', 'Chocolate'),
                ('📊 Reporte Semanal', 
                 'Nuevo reporte de inventario disponible para revisión.', 
                 'info', 'empleado', 1, 'Sistema', 'reportes', 'crear', 'Reporte Inventario')
            `);
            console.log('✅ Notificaciones de ejemplo insertadas');
        } else {
            console.log('✅ La tabla notifications existe');
        }
        
        // 3. Verificar estructura de la tabla
        console.log('\n3. 🏗️ Verificando estructura de la tabla...');
        const structure = await db.execute('PRAGMA table_info(notifications)');
        console.log('📋 Columnas de la tabla notifications:');
        structure.rows.forEach(col => {
            console.log(`   - ${col.name}: ${col.type}`);
        });
        
        // 4. Contar notificaciones existentes
        console.log('\n4. 📊 Contando notificaciones...');
        const count = await db.execute('SELECT COUNT(*) as total FROM notifications');
        console.log(`📈 Total de notificaciones: ${count.rows[0].total}`);
        
        // 5. Obtener algunas notificaciones de ejemplo
        if (count.rows[0].total > 0) {
            console.log('\n5. 📋 Primeras 3 notificaciones:');
            const samples = await db.execute('SELECT * FROM notifications LIMIT 3');
            samples.rows.forEach((notif, index) => {
                console.log(`   ${index + 1}. ${notif.titulo} (${notif.tipo}) - ${notif.estado}`);
            });
        }
        
        // 6. Probar consulta similar a la API
        console.log('\n6. 🔍 Probando consulta de API (para administrador)...');
        const userNotifications = await db.execute(`
            SELECT * FROM notifications 
            WHERE (tipo_usuario_destinatario = 'administrador' OR tipo_usuario_destinatario IS NULL)
            ORDER BY created_at DESC
        `);
        console.log(`✅ Consulta API exitosa: ${userNotifications.rows.length} notificaciones encontradas`);
        
        console.log('\n🎉 ¡Todas las pruebas de Turso completadas exitosamente!');
        console.log('\n📊 RESUMEN:');
        console.log(`   - Conexión a Turso: ✅ FUNCIONANDO`);
        console.log(`   - Tabla notifications: ✅ EXISTE`);
        console.log(`   - Datos en tabla: ✅ ${count.rows[0].total} registros`);
        console.log(`   - Consulta API: ✅ ${userNotifications.rows.length} resultados`);
        
        return {
            success: true,
            connectionWorking: true,
            tableExists: true,
            totalNotifications: count.rows[0].total,
            apiQueryResults: userNotifications.rows.length
        };
        
    } catch (error) {
        console.error('\n❌ Error en prueba de Turso:', error);
        console.log('\n📊 RESUMEN:');
        console.log(`   - Conexión a Turso: ❌ ERROR`);
        console.log(`   - Error: ${error.message}`);
        
        return {
            success: false,
            error: error.message,
            connectionWorking: false
        };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testTursoNotifications()
        .then(result => {
            console.log('\n🏁 Prueba completada:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { testTursoNotifications }; 