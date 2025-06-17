const Usuario = require('./models/usuario');
const PushNotificationService = require('./services/pushNotificationService');

async function testNotificationSystem() {
    console.log('🧪 Probando sistema de notificaciones...\n');
    
    try {
        // 1. Verificar usuarios elegibles
        console.log('1️⃣ Verificando usuarios...');
        const allUsers = await Usuario.getAllUsuarios();
        const admins = allUsers.filter(user => user.rol === 'administrador');
        const employees = allUsers.filter(user => user.rol === 'empleado');
        console.log(`   📊 Total usuarios: ${allUsers.length}`);
        console.log(`   👑 Administradores: ${admins.length}`);
        console.log(`   👷 Empleados: ${employees.length}`);
        console.log(`   ✅ Usuarios elegibles para notificaciones: ${admins.length + employees.length}`);
        
        // 2. Verificar push tokens
        console.log('\n2️⃣ Verificando push tokens...');
        const userTokens = await Usuario.getAdminPushTokens();
        console.log(`   🔑 Tokens registrados: ${userTokens.length}`);
        
        if (userTokens.length === 0) {
            console.log('   ⚠️  NO HAY TOKENS REGISTRADOS');
            console.log('   💡 Los usuarios deben loguearse en la app móvil primero');
        } else {
            userTokens.forEach((token, index) => {
                console.log(`   🔸 Token ${index + 1}: ${token.substring(0, 30)}...`);
            });
        }
        
        // 3. Probar envío de notificación (solo si hay tokens)
        if (userTokens.length > 0) {
            console.log('\n3️⃣ Enviando notificación de prueba...');
            await PushNotificationService.sendCustomNotification(
                '🧪 Prueba del Sistema',
                'El sistema de notificaciones está funcionando correctamente!',
                'test',
                { timestamp: new Date().toISOString() }
            );
            console.log('   ✅ Notificación enviada');
        } else {
            console.log('\n3️⃣ Saltando envío de notificación (no hay tokens)');
        }
        
        console.log('\n✅ Prueba completada');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
    
    process.exit(0);
}

// Ejecutar prueba
testNotificationSystem(); 