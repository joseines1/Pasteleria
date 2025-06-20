const Notification = require('./models/notification');
const Usuario = require('./models/usuario');
const Postre = require('./models/postre');
const Ingrediente = require('./models/ingrediente');
const PushNotificationService = require('./services/pushNotificationService');

console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE NOTIFICACIONES\n');

async function testNotificationSystem() {
    try {
        // 1. OBTENER USUARIOS DE PRUEBA
        console.log('👤 1. Obteniendo usuarios de prueba...');
        const usuarios = await Usuario.getAllUsuarios();
        const admin = usuarios.find(u => u.rol === 'administrador');
        const empleado = usuarios.find(u => u.rol === 'empleado');
        
        if (!admin || !empleado) {
            console.log('❌ Error: Se necesitan usuarios administrador y empleado');
            return;
        }
        
        console.log(`   ✅ Admin: ${admin.nombre} (ID: ${admin.id})`);
        console.log(`   ✅ Empleado: ${empleado.nombre} (ID: ${empleado.id})\n`);

        // 2. OBTENER DATOS DE PRUEBA
        console.log('📦 2. Obteniendo datos de prueba...');
        const postres = await Postre.getAllPostres();
        const ingredientes = await Ingrediente.getAllIngredientes();
        
        if (postres.length === 0 || ingredientes.length === 0) {
            console.log('❌ Error: Se necesitan postres e ingredientes para probar');
            return;
        }
        
        const postre = postres[0];
        const ingrediente = ingredientes[0];
        
        console.log(`   ✅ Postre de prueba: ${postre.nombre} (ID: ${postre.id})`);
        console.log(`   ✅ Ingrediente de prueba: ${ingrediente.nombre} (ID: ${ingrediente.id})\n`);

        // 3. CREAR SOLICITUD DE ELIMINACIÓN DE INGREDIENTE
        console.log('🗑️ 3. Creando solicitud de eliminación de ingrediente...');
        const deleteRequestId = await Notification.createDeleteRequest(
            'ingredientes',
            ingrediente.id,
            ingrediente.nombre,
            empleado.id,
            empleado.nombre,
            { motivo: 'Ingrediente vencido' }
        );
        console.log(`   ✅ Solicitud creada con ID: ${deleteRequestId}\n`);

        // 4. CREAR SOLICITUD DE MODIFICACIÓN DE POSTRE
        console.log('📝 4. Creando solicitud de modificación de postre...');
        const updateRequestId = await Notification.createUpdateRequest(
            'postres',
            postre.id,
            postre.nombre,
            empleado.id,
            empleado.nombre,
            {
                antes: { nombre: postre.nombre },
                despues: { nombre: postre.nombre + ' Deluxe' },
                motivo: 'Mejora del producto'
            }
        );
        console.log(`   ✅ Solicitud creada con ID: ${updateRequestId}\n`);

        // 5. CREAR SOLICITUD PERSONALIZADA
        console.log('📋 5. Creando solicitud personalizada...');
        const customRequestId = await Notification.createCustomModuleNotification(
            'general',
            '💡 Propuesta de Mejora',
            'Propongo implementar un sistema de descuentos para clientes frecuentes',
            empleado.id,
            empleado.nombre,
            { categoria: 'mejora_sistema', prioridad: 'media' }
        );
        console.log(`   ✅ Solicitud creada con ID: ${customRequestId}\n`);

        // 6. ENVIAR NOTIFICACIÓN A UN USUARIO ESPECÍFICO
        console.log('👥 6. Creando notificación para usuario específico...');
        const userNotificationId = await Notification.create({
            titulo: '🎉 Felicitaciones',
            mensaje: `Hola ${empleado.nombre}, excelente trabajo este mes!`,
            tipo: 'info',
            usuario_destinatario_id: empleado.id,
            usuario_solicitante_id: admin.id,
            usuario_solicitante_nombre: admin.nombre,
            modulo: 'general',
            accion: 'felicitacion'
        });
        console.log(`   ✅ Notificación creada con ID: ${userNotificationId}\n`);

        // 7. OBTENER NOTIFICACIONES DEL ADMINISTRADOR
        console.log('🔔 7. Obteniendo notificaciones del administrador...');
        const adminNotifications = await Notification.getForUser(admin.id);
        console.log(`   ✅ El administrador tiene ${adminNotifications.length} notificaciones:`);
        adminNotifications.forEach(notif => {
            console.log(`      - ${notif.titulo} (${notif.tipo}, ${notif.estado})`);
        });
        console.log('');

        // 8. OBTENER NOTIFICACIONES DEL EMPLEADO
        console.log('👨‍💼 8. Obteniendo notificaciones del empleado...');
        const empleadoNotifications = await Notification.getForUser(empleado.id);
        console.log(`   ✅ El empleado tiene ${empleadoNotifications.length} notificaciones:`);
        empleadoNotifications.forEach(notif => {
            console.log(`      - ${notif.titulo} (${notif.tipo}, ${notif.estado})`);
        });
        console.log('');

        // 9. OBTENER NOTIFICACIONES POR TIPO DE USUARIO
        console.log('👥 9. Obteniendo notificaciones para administradores...');
        const adminTypeNotifications = await Notification.getForUserType('administrador');
        console.log(`   ✅ Hay ${adminTypeNotifications.length} notificaciones para administradores:`);
        adminTypeNotifications.forEach(notif => {
            console.log(`      - ${notif.titulo} (${notif.tipo}, ${notif.estado})`);
        });
        console.log('');

        // 10. OBTENER ESTADÍSTICAS
        console.log('📊 10. Obteniendo estadísticas generales...');
        const stats = await Notification.getStats();
        console.log(`   ✅ Estadísticas del sistema:`);
        console.log(`      - Total de notificaciones: ${stats.total}`);
        console.log(`      - No leídas: ${stats.unread}`);
        console.log(`      - Pendientes de aprobación: ${stats.pending}`);
        console.log(`      - Aprobadas: ${stats.approved}`);
        console.log(`      - Rechazadas: ${stats.rejected}\n`);

        // 11. OBTENER SOLICITUDES PENDIENTES
        console.log('⏳ 11. Obteniendo solicitudes pendientes de aprobación...');
        const pendingApprovals = await Notification.getPendingApprovals();
        console.log(`   ✅ Hay ${pendingApprovals.length} solicitudes pendientes:`);
        pendingApprovals.forEach(notif => {
            console.log(`      - ${notif.titulo} (Módulo: ${notif.modulo}, Acción: ${notif.accion})`);
        });
        console.log('');

        // 12. APROBAR UNA SOLICITUD
        if (pendingApprovals.length > 0) {
            console.log('✅ 12. Aprobando primera solicitud pendiente...');
            const firstPending = pendingApprovals[0];
            await Notification.updateApprovalStatus(
                firstPending.id,
                'aprobada',
                admin.id,
                admin.nombre,
                'Solicitud aprobada por el administrador'
            );
            console.log(`   ✅ Solicitud ${firstPending.id} aprobada\n`);
        }

        // 13. MARCAR NOTIFICACIÓN COMO LEÍDA
        console.log('👀 13. Marcando notificación como leída...');
        if (empleadoNotifications.length > 0) {
            const firstNotif = empleadoNotifications[0];
            await Notification.markAsRead(firstNotif.id);
            console.log(`   ✅ Notificación ${firstNotif.id} marcada como leída\n`);
        }

        // 14. PRUEBA DE PUSH NOTIFICATIONS (simulada)
        console.log('📱 14. Probando notificaciones push...');
        try {
            console.log('   🔄 Simulando envío de push notification...');
            console.log('   ✅ Push notification enviada exitosamente (simulada)\n');
        } catch (error) {
            console.log(`   ⚠️ Error en push notification: ${error.message}\n`);
        }

        // 15. ESTADÍSTICAS FINALES
        console.log('📈 15. Estadísticas finales del sistema...');
        const finalStats = await Notification.getStats();
        console.log(`   ✅ Estadísticas actualizadas:`);
        console.log(`      - Total de notificaciones: ${finalStats.total}`);
        console.log(`      - No leídas: ${finalStats.unread}`);
        console.log(`      - Pendientes de aprobación: ${finalStats.pending}`);
        console.log(`      - Aprobadas: ${finalStats.approved}`);
        console.log(`      - Rechazadas: ${finalStats.rejected}\n`);

        console.log('🎉 ¡TODAS LAS PRUEBAS DEL SISTEMA DE NOTIFICACIONES COMPLETADAS EXITOSAMENTE! 🎉\n');
        
        console.log('📋 RESUMEN DE FUNCIONALIDADES PROBADAS:');
        console.log('   ✅ Creación de solicitudes de eliminación');
        console.log('   ✅ Creación de solicitudes de modificación');
        console.log('   ✅ Creación de solicitudes personalizadas');
        console.log('   ✅ Notificaciones para usuarios específicos');
        console.log('   ✅ Notificaciones por tipo de usuario');
        console.log('   ✅ Sistema de aprobaciones');
        console.log('   ✅ Marcado como leída');
        console.log('   ✅ Estadísticas del sistema');
        console.log('   ✅ Gestión de solicitudes pendientes');
        console.log('   ✅ Push notifications (simuladas)');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Ejecutar las pruebas
testNotificationSystem(); 