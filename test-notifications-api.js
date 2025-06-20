const apiService = require('./services/notificationService');
const Notification = require('./models/notification');

async function testNotificationsAPI() {
    console.log('🧪 PROBANDO API DE NOTIFICACIONES\n');
    
    try {
        // 1. Probar obtener todas las notificaciones
        console.log('📋 1. Probando obtener todas las notificaciones...');
        const allNotifications = await Notification.getForUserType('administrador');
        console.log(`   ✅ Encontradas ${allNotifications.length} notificaciones para administradores\n`);
        
        // 2. Probar estadísticas
        console.log('📊 2. Probando estadísticas...');
        const stats = await Notification.getStats();
        console.log(`   ✅ Estadísticas:`, stats);
        console.log('');
        
        // 3. Crear una notificación de prueba
        console.log('🆕 3. Creando notificación de prueba...');
        const newNotificationId = await Notification.create({
            titulo: '🧪 Notificación de Prueba',
            mensaje: 'Esta es una notificación de prueba para verificar que el sistema funciona',
            tipo: 'info',
            tipo_usuario_destinatario: 'administrador',
            usuario_solicitante_id: 1,
            usuario_solicitante_nombre: 'Sistema de Pruebas',
            modulo: 'general',
            accion: 'prueba',
            datos_adicionales: { prueba: true, timestamp: new Date().toISOString() }
        });
        console.log(`   ✅ Notificación creada con ID: ${newNotificationId}\n`);
        
        // 4. Verificar que se creó
        console.log('🔍 4. Verificando notificación creada...');
        const createdNotification = await Notification.getById(newNotificationId);
        if (createdNotification) {
            console.log(`   ✅ Notificación encontrada: "${createdNotification.titulo}"`);
            console.log(`   📝 Mensaje: ${createdNotification.mensaje}`);
            console.log(`   📊 Estado: ${createdNotification.estado}`);
        } else {
            console.log('   ❌ Notificación no encontrada');
        }
        console.log('');
        
        // 5. Estadísticas finales
        console.log('📈 5. Estadísticas finales...');
        const finalStats = await Notification.getStats();
        console.log(`   ✅ Total de notificaciones: ${finalStats.total}`);
        console.log(`   📬 No leídas: ${finalStats.unread}`);
        console.log(`   ⏳ Pendientes: ${finalStats.pending}`);
        console.log('');
        
        console.log('🎉 ¡PRUEBA COMPLETA! El sistema de notificaciones funciona correctamente.');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        console.error('Stack:', error.stack);
    }
}

// Ejecutar la prueba
testNotificationsAPI(); 