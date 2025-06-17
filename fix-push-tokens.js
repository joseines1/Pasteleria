const db = require('./models/db');

async function fixPushTokens() {
    console.log('🔧 Reparando Push Tokens\n');

    try {
        // 1. Limpiar tokens inválidos/duplicados
        console.log('1️⃣ Limpiando tokens inválidos...');
        
        // Limpiar el token problemático específico
        const invalidToken = 'ExponentPushToken[C6i0ttltQ2waW0ZWFV7zZ4]';
        
        const result = await db.execute(
            'UPDATE usuarios SET push_token = NULL WHERE push_token = ?',
            [invalidToken]
        );
        
        console.log(`✅ Tokens inválidos limpiados: ${result.changes || result.rowsAffected || 0}`);

        // 2. Mostrar usuarios sin tokens
        console.log('\n2️⃣ Verificando estado actual...');
        const users = await db.execute('SELECT id, nombre, email, rol, push_token FROM usuarios');
        
        console.log('\n👥 Estado de usuarios:');
        users.rows.forEach(user => {
            const tokenStatus = user.push_token ? '✅ Tiene token' : '❌ Sin token';
            console.log(`   ${user.nombre} (${user.rol}): ${tokenStatus}`);
        });

        console.log('\n📋 Instrucciones para solucionar:');
        console.log('\n🔧 En la App Móvil:');
        console.log('   1. Cierra completamente la aplicación');
        console.log('   2. Abre la configuración del dispositivo');
        console.log('   3. Ve a Aplicaciones > [Tu App] > Notificaciones');
        console.log('   4. Asegúrate de que las notificaciones estén HABILITADAS');
        console.log('   5. Vuelve a abrir la app');
        console.log('   6. Inicia sesión nuevamente');
        console.log('   7. La app debería generar un nuevo token válido');

        console.log('\n📱 Verificaciones en el Dispositivo:');
        console.log('   □ Permisos de notificaciones habilitados');
        console.log('   □ Conexión a internet activa');
        console.log('   □ App actualizada a la última versión');
        console.log('   □ No hay modo "No molestar" activado');

        console.log('\n🔄 Pasos para Regenerar Token:');
        console.log('   1. En la app, ve a "Configuración" o "Perfil"');
        console.log('   2. Cierra sesión completamente');
        console.log('   3. Vuelve a iniciar sesión');
        console.log('   4. La app debería solicitar permisos de notificaciones');
        console.log('   5. Acepta los permisos');
        console.log('   6. El nuevo token se guardará automáticamente');

        console.log('\n🧪 Para Probar:');
        console.log('   1. Después de regenerar el token, usa la pantalla de prueba');
        console.log('   2. O ejecuta: node debug-push-tokens.js');
        console.log('   3. Deberías ver un token diferente y válido');

    } catch (error) {
        console.error('❌ Error reparando tokens:', error);
    }
}

// Ejecutar reparación
console.log('🚀 Iniciando reparación de push tokens...\n');
fixPushTokens(); 