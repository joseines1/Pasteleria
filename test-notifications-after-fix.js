const PushNotificationService = require('./services/pushNotificationService');
const Usuario = require('./models/usuario');

async function testNotificationsAfterFix() {
    console.log('🔍 VERIFICANDO SISTEMA DE NOTIFICACIONES DESPUÉS DE LA LIMPIEZA');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar tokens actuales
        console.log('\n1️⃣  VERIFICANDO TOKENS ACTUALES...');
        const userTokens = await Usuario.getAdminPushTokens();
        console.log(`📊 Total de tokens en BD: ${userTokens.length}`);
        
        if (userTokens.length === 0) {
            console.log('⚠️  NO HAY TOKENS REGISTRADOS');
            console.log('');
            console.log('📱 INSTRUCCIONES PARA USUARIOS:');
            console.log('   1. Abrir la app móvil');
            console.log('   2. Cerrar sesión si ya está logueado');
            console.log('   3. Iniciar sesión nuevamente');
            console.log('   4. Permitir notificaciones cuando se solicite');
            console.log('   5. El token se generará automáticamente');
            console.log('');
            return;
        }
        
        // 2. Limpiar tokens inválidos
        console.log('\n2️⃣  LIMPIANDO TOKENS INVÁLIDOS...');
        const cleanResult = await PushNotificationService.cleanInvalidTokens();
        
        // 3. Enviar notificación de prueba
        console.log('\n3️⃣  ENVIANDO NOTIFICACIÓN DE PRUEBA...');
        const testResult = await PushNotificationService.sendCustomNotification(
            '🧪 Prueba del Sistema',
            'Esta es una notificación de prueba después de la limpieza de tokens',
            'test',
            { testId: Date.now() }
        );
        
        // 4. Mostrar resultados
        console.log('\n📊 RESULTADOS DE LA PRUEBA:');
        console.log(`   ✅ Enviadas exitosamente: ${testResult.sent}`);
        console.log(`   ❌ Con errores: ${testResult.errors}`);
        console.log(`   📱 Total de tokens válidos: ${testResult.totalTokens || 0}`);
        
        if (testResult.sent > 0) {
            console.log('\n🎉 ¡SISTEMA DE NOTIFICACIONES FUNCIONANDO CORRECTAMENTE!');
            console.log('   Las notificaciones deberían aparecer en los dispositivos móviles');
        } else {
            console.log('\n⚠️  SISTEMA NECESITA ATENCIÓN:');
            if (testResult.message) {
                console.log(`   Mensaje: ${testResult.message}`);
            }
            console.log('   Los usuarios necesitan regenerar sus tokens de notificación');
        }
        
        // 5. Probar notificaciones CRUD
        if (testResult.sent > 0) {
            console.log('\n4️⃣  PROBANDO NOTIFICACIONES CRUD...');
            
            // Simular creación de ingrediente
            const ingredienteResult = await PushNotificationService.notifyIngredienteCreated(
                { id: 999, nombre: 'Ingrediente de Prueba' },
                'Sistema de Prueba'
            );
            
            // Simular actualización de postre
            const postreResult = await PushNotificationService.notifyPostreUpdated(
                { id: 888, nombre: 'Postre de Prueba' },
                'Sistema de Prueba'
            );
            
            console.log(`   📦 Notificación ingrediente: ${ingredienteResult.sent} enviadas`);
            console.log(`   🍰 Notificación postre: ${postreResult.sent} enviadas`);
        }
        
        console.log('\n' + '=' .repeat(60));
        console.log('✅ VERIFICACIÓN COMPLETADA');
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    }
}

// Ejecutar la prueba
testNotificationsAfterFix(); 