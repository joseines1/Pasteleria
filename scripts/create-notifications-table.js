const db = require('../models/db');

async function createNotificationsTable() {
    try {
        console.log('🗄️ Creando tabla de notificaciones...');

        // Crear tabla notifications
        await db.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                mensaje TEXT NOT NULL,
                tipo TEXT NOT NULL, -- 'info', 'solicitud', 'aprobacion', 'rechazo', 'alerta'
                estado TEXT DEFAULT 'no_leida', -- 'no_leida', 'leida', 'aprobada', 'rechazada'
                
                -- Destinatario
                usuario_destinatario_id INTEGER, -- NULL = para todos los admins
                tipo_usuario_destinatario TEXT, -- 'administrador', 'empleado', NULL = específico por ID
                
                -- Creador/Solicitante
                usuario_solicitante_id INTEGER NOT NULL,
                usuario_solicitante_nombre TEXT NOT NULL,
                
                -- Contexto del módulo
                modulo TEXT NOT NULL, -- 'ingredientes', 'postres', 'recetas', 'usuarios', 'general'
                accion TEXT NOT NULL, -- 'crear', 'actualizar', 'eliminar', 'solicitar_eliminar', 'solicitar_actualizar', 'personalizada'
                
                -- Datos del objeto afectado
                objeto_id INTEGER, -- ID del ingrediente, postre, etc.
                objeto_nombre TEXT, -- Nombre del objeto para referencia
                datos_adicionales TEXT, -- JSON con datos extra
                
                -- Metadata
                requiere_aprobacion BOOLEAN DEFAULT FALSE,
                aprobada_por_id INTEGER, -- ID del usuario que aprobó/rechazó
                aprobada_por_nombre TEXT, -- Nombre del usuario que aprobó/rechazó
                fecha_aprobacion DATETIME,
                comentario_aprobacion TEXT,
                
                -- Timestamps
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME, -- Para notificaciones que expiran
                
                -- Relaciones foráneas
                FOREIGN KEY (usuario_destinatario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
                FOREIGN KEY (usuario_solicitante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (aprobada_por_id) REFERENCES usuarios(id) ON DELETE SET NULL
            )
        `);

        console.log('✅ Tabla notifications creada');

        // Crear índices para optimizar consultas
        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_notifications_destinatario 
            ON notifications(usuario_destinatario_id, estado)
        `);

        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_notifications_tipo_usuario 
            ON notifications(tipo_usuario_destinatario, estado)
        `);

        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_notifications_modulo 
            ON notifications(modulo, accion)
        `);

        await db.execute(`
            CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
            ON notifications(created_at DESC)
        `);

        console.log('✅ Índices creados');

        // Insertar algunas notificaciones de ejemplo
        console.log('📝 Creando notificaciones de ejemplo...');

        // Ejemplo 1: Notificación general para administradores
        await db.execute(`
            INSERT INTO notifications (
                titulo, mensaje, tipo, tipo_usuario_destinatario,
                usuario_solicitante_id, usuario_solicitante_nombre,
                modulo, accion, objeto_nombre
            ) VALUES (
                '🎉 Sistema de Notificaciones Activado',
                'El nuevo sistema de notificaciones ya está disponible. Ahora podrás gestionar solicitudes y recibir alertas personalizadas.',
                'info',
                'administrador',
                1,
                'Sistema',
                'general',
                'personalizada',
                'Sistema de Notificaciones'
            )
        `);

        // Ejemplo 2: Solicitud de eliminación pendiente
        await db.execute(`
            INSERT INTO notifications (
                titulo, mensaje, tipo, estado, tipo_usuario_destinatario,
                usuario_solicitante_id, usuario_solicitante_nombre,
                modulo, accion, objeto_id, objeto_nombre,
                requiere_aprobacion, expires_at
            ) VALUES (
                '🗑️ Solicitud de Eliminación',
                'El empleado Juan solicita eliminar el ingrediente "Chocolate Amargo". ¿Aprobar eliminación?',
                'solicitud',
                'no_leida',
                'administrador',
                2,
                'Juan Empleado',
                'ingredientes',
                'solicitar_eliminar',
                5,
                'Chocolate Amargo',
                TRUE,
                datetime('now', '+7 days')
            )
        `);

        console.log('✅ Notificaciones de ejemplo creadas');
        console.log('🎯 Tabla notifications lista para usar');

    } catch (error) {
        console.error('❌ Error creando tabla notifications:', error);
        throw error;
    }
}

// Función para verificar la estructura de la tabla
async function verifyNotificationsTable() {
    try {
        const result = await db.execute("PRAGMA table_info(notifications)");
        console.log('\n📋 Estructura de la tabla notifications:');
        result.rows.forEach(column => {
            console.log(`   ${column.name}: ${column.type} ${column.notnull ? 'NOT NULL' : ''} ${column.dflt_value ? `DEFAULT ${column.dflt_value}` : ''}`);
        });

        const count = await db.execute("SELECT COUNT(*) as total FROM notifications");
        console.log(`\n📊 Total de notificaciones: ${count.rows[0].total}`);

    } catch (error) {
        console.error('❌ Error verificando tabla:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createNotificationsTable()
        .then(() => verifyNotificationsTable())
        .then(() => {
            console.log('\n🎉 ¡Tabla de notificaciones lista!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = { createNotificationsTable, verifyNotificationsTable }; 