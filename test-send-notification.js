const PushNotificationService = require('./services/pushNotificationService');

async function testSendNotification() {
    try {
        console.log('🧪 Enviando notificación de prueba...\n');

        // Enviar notificación a administradores usando el método sendToAdmins
        const result = await PushNotificationService.sendToAdmins(
            '🎉 ¡Notificación de Prueba!',
            'Esta es una notificación enviada desde el servidor para probar el sistema. ¡Funciona perfectamente!',
            {
                module: 'test',
                type: 'server_test',
                timestamp: new Date().toISOString(),
                priority: 'high'
            }
        );

        console.log('📊 Resultado del envío:');
        console.log(`   ✅ Notificaciones enviadas: ${result.sent}`);
        console.log(`   ❌ Errores: ${result.errors}`);
        console.log(`   📱 Push tokens activos: ${result.totalTokens}`);

        if (result.details && result.details.length > 0) {
            console.log('\n📋 Detalles por usuario:');
            result.details.forEach((detail, index) => {
                console.log(`   ${index + 1}. ${detail.status === 'ok' ? '✅' : '❌'} ${detail.message || 'Enviado'}`);
            });
        }

        console.log('\n🎯 ¿Dónde verás la notificación?');
        console.log('   📱 Si la app está cerrada: En la barra de notificaciones del dispositivo');
        console.log('   📱 Si la app está abierta: Como una alerta/modal dentro de la app');
        console.log('   🔊 Con sonido y vibración (si están habilitados)');

        console.log('\n✅ Prueba completada');

    } catch (error) {
        console.error('❌ Error enviando notificación de prueba:', error);
    }
}

// Ejecutar la prueba
testSendNotification(); 