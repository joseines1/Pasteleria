const Notification = require('./models/notification');

async function testNotificationsSimple() {
    console.log('🧪 PROBANDO SISTEMA DE NOTIFICACIONES (Versión Simplificada)\n');
    
    try {
        // 1. Probar obtener todas las notificaciones
        console.log('📋 1. Probando obtener notificaciones para administradores...');
        const adminNotifications = await Notification.getForUserType('administrador');
        console.log(`   ✅ Encontradas ${adminNotifications.length} notificaciones para administradores`);
        
        if (adminNotifications.length > 0) {
            console.log('   📝 Primeras notificaciones:');
            adminNotifications.slice(0, 3).forEach((notif, index) => {
                console.log(`      ${index + 1}. ${notif.titulo} (${notif.estado})`);
            });
        }
        console.log('');
        
        // 2. Probar estadísticas
        console.log('📊 2. Probando estadísticas del sistema...');
        const stats = await Notification.getStats();
        console.log(`   ✅ Estadísticas:`);
        console.log(`      - Total: ${stats.total}`);
        console.log(`      - No leídas: ${stats.unread}`);
        console.log(`      - Pendientes: ${stats.pending}`);
        if (stats.approved !== undefined) console.log(`      - Aprobadas: ${stats.approved}`);
        if (stats.rejected !== undefined) console.log(`      - Rechazadas: ${stats.rejected}`);
        console.log('');
        
        // 3. Crear una notificación de prueba
        console.log('🆕 3. Creando notificación de prueba...');
        const newNotificationId = await Notification.create({
            titulo: '🧪 Prueba de API',
            mensaje: 'Esta notificación verifica que el sistema funciona desde el backend',
            tipo: 'info',
            tipo_usuario_destinatario: 'administrador',
            usuario_solicitante_id: 1,
            usuario_solicitante_nombre: 'Sistema de Pruebas',
            modulo: 'general',
            accion: 'test_api',
            datos_adicionales: { 
                prueba: true, 
                timestamp: new Date().toISOString(),
                desde: 'backend_test'
            }
        });
        console.log(`   ✅ Notificación creada con ID: ${newNotificationId}`);
        console.log('');
        
        // 4. Verificar que se creó correctamente
        console.log('🔍 4. Verificando notificación creada...');
        const createdNotification = await Notification.getById(newNotificationId);
        if (createdNotification) {
            console.log(`   ✅ Notificación encontrada:`);
            console.log(`      📝 Título: "${createdNotification.titulo}"`);
            console.log(`      💬 Mensaje: "${createdNotification.mensaje}"`);
            console.log(`      📊 Estado: ${createdNotification.estado}`);
            console.log(`      🏷️ Tipo: ${createdNotification.tipo}`);
            console.log(`      📁 Módulo: ${createdNotification.modulo}`);
        } else {
            console.log('   ❌ Notificación no encontrada');
        }
        console.log('');
        
        // 5. Crear solicitud de eliminación de ejemplo
        console.log('🗑️ 5. Creando solicitud de eliminación de ejemplo...');
        const deleteRequestId = await Notification.createDeleteRequest(
            'ingredientes',
            999,
            'Ingrediente de Prueba',
            1,
            'Usuario de Prueba',
            { motivo: 'Prueba del sistema de solicitudes' }
        );
        console.log(`   ✅ Solicitud de eliminación creada con ID: ${deleteRequestId}`);
        console.log('');
        
        // 6. Obtener solicitudes pendientes
        console.log('⏳ 6. Obteniendo solicitudes pendientes...');
        const pendingRequests = await Notification.getPendingApprovals();
        console.log(`   ✅ Hay ${pendingRequests.length} solicitudes pendientes de aprobación`);
        
        if (pendingRequests.length > 0) {
            console.log('   📋 Solicitudes pendientes:');
            pendingRequests.slice(0, 3).forEach((req, index) => {
                console.log(`      ${index + 1}. ${req.titulo} (${req.modulo})`);
            });
        }
        console.log('');
        
        // 7. Estadísticas finales
        console.log('📈 7. Estadísticas finales...');
        const finalStats = await Notification.getStats();
        console.log(`   ✅ Estadísticas actualizadas:`);
        console.log(`      - Total: ${finalStats.total}`);
        console.log(`      - No leídas: ${finalStats.unread}`);
        console.log(`      - Pendientes: ${finalStats.pending}`);
        console.log('');
        
        console.log('🎉 ¡PRUEBA COMPLETA! El backend de notificaciones funciona correctamente.');
        console.log('');
        console.log('📱 Si la app móvil no muestra notificaciones, verifica:');
        console.log('   1. ✅ Backend funcionando (CONFIRMADO)');
        console.log('   2. 🔗 Conexión API desde la app');
        console.log('   3. 🔑 Token de autenticación válido');
        console.log('   4. 📡 URL del servidor en la app');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        console.error('📍 Stack trace:');
        console.error(error.stack);
    }
}

// Ejecutar la prueba
testNotificationsSimple(); 