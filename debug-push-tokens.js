const Usuario = require('./models/usuario');
const { Expo } = require('expo-server-sdk');

async function debugPushTokens() {
    console.log('🔍 Diagnóstico de Push Tokens\n');

    try {
        // 1. Obtener todos los tokens de la base de datos
        console.log('1️⃣ Obteniendo tokens de la base de datos...');
        const userTokens = await Usuario.getAdminPushTokens();
        
        console.log(`📊 Total de tokens encontrados: ${userTokens.length}`);
        
        if (userTokens.length === 0) {
            console.log('❌ No hay tokens registrados en la base de datos');
            console.log('\n💡 Posibles soluciones:');
            console.log('   • Asegúrate de que los usuarios hayan iniciado sesión en la app móvil');
            console.log('   • Verifica que la app tenga permisos de notificaciones');
            console.log('   • Confirma que el token se esté guardando correctamente');
            return;
        }

        // 2. Mostrar todos los tokens
        console.log('\n📱 Tokens encontrados:');
        userTokens.forEach((token, index) => {
            console.log(`   ${index + 1}. ${token.substring(0, 20)}...${token.substring(token.length - 10)}`);
        });

        // 3. Validar tokens con Expo
        console.log('\n2️⃣ Validando tokens con Expo SDK...');
        const validTokens = [];
        const invalidTokens = [];

        userTokens.forEach(token => {
            if (Expo.isExpoPushToken(token)) {
                validTokens.push(token);
            } else {
                invalidTokens.push(token);
            }
        });

        console.log(`✅ Tokens válidos: ${validTokens.length}`);
        console.log(`❌ Tokens inválidos: ${invalidTokens.length}`);

        if (invalidTokens.length > 0) {
            console.log('\n🚨 Tokens inválidos encontrados:');
            invalidTokens.forEach((token, index) => {
                console.log(`   ${index + 1}. ${token.substring(0, 30)}...`);
            });
        }

        if (validTokens.length === 0) {
            console.log('\n❌ No hay tokens válidos para enviar notificaciones');
            console.log('\n💡 Posibles causas:');
            console.log('   • Los tokens no tienen el formato correcto de Expo');
            console.log('   • Los tokens pueden haber expirado');
            console.log('   • La app no está usando Expo para notificaciones');
            return;
        }

        // 4. Probar envío de notificación de diagnóstico
        console.log('\n3️⃣ Enviando notificación de prueba...');
        
        const expo = new Expo();
        const messages = validTokens.map(token => ({
            to: token,
            sound: 'default',
            title: '🔧 Prueba de Diagnóstico',
            body: 'Si ves esta notificación, el sistema funciona correctamente',
            data: { 
                test: true,
                timestamp: new Date().toISOString()
            },
            priority: 'high'
        }));

        const chunks = expo.chunkPushNotifications(messages);
        let totalTickets = 0;
        let errors = 0;

        for (let chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                totalTickets += ticketChunk.length;
                
                // Verificar si hay errores en los tickets
                ticketChunk.forEach((ticket, index) => {
                    if (ticket.status === 'error') {
                        console.log(`❌ Error en ticket ${index + 1}:`, ticket.message);
                        errors++;
                    } else {
                        console.log(`✅ Ticket ${index + 1}: ${ticket.status}`);
                    }
                });
                
            } catch (error) {
                console.error('❌ Error enviando chunk:', error);
                errors++;
            }
        }

        console.log(`\n📊 Resumen del envío:`);
        console.log(`   📤 Tickets generados: ${totalTickets}`);
        console.log(`   ❌ Errores: ${errors}`);
        console.log(`   ✅ Exitosos: ${totalTickets - errors}`);

        // 5. Verificar configuración de la app
        console.log('\n4️⃣ Verificaciones adicionales...');
        console.log('\n📋 Lista de verificación:');
        console.log('   □ ¿La app móvil tiene permisos de notificaciones habilitados?');
        console.log('   □ ¿El dispositivo está conectado a internet?');
        console.log('   □ ¿La app está usando Expo para las notificaciones?');
        console.log('   □ ¿Los usuarios han iniciado sesión recientemente?');
        console.log('   □ ¿El token se está guardando correctamente en la base de datos?');

        console.log('\n💡 Si las notificaciones aún no llegan:');
        console.log('   1. Verifica los permisos de notificaciones en el dispositivo');
        console.log('   2. Asegúrate de que la app esté configurada con Expo');
        console.log('   3. Prueba cerrar y abrir la app para regenerar el token');
        console.log('   4. Verifica que no haya un firewall bloqueando las conexiones');

    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error);
    }
}

// Ejecutar diagnóstico
console.log('🚀 Iniciando diagnóstico de push tokens...\n');
debugPushTokens(); 