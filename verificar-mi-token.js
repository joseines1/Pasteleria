const axios = require('axios');

async function verificarMiToken() {
    console.log('🔍 VERIFICANDO TU TOKEN ESPECÍFICO');
    console.log('=' .repeat(50));
    
    try {
        // 1. Login como admin
        console.log('🔐 Haciendo login como administrador...');
        const loginResponse = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        const { usuario, token } = loginResponse.data;
        console.log(`✅ Login exitoso: ${usuario.nombre}`);
        console.log(`📱 Tu push token: ${usuario.push_token || 'NO TIENES TOKEN'}`);
        
        if (!usuario.push_token) {
            console.log('\n❌ PROBLEMA ENCONTRADO:');
            console.log('🔴 Tu usuario administrador NO tiene push token registrado');
            console.log('💡 SOLUCIÓN: Abrir la app móvil y:');
            console.log('   1. Login como admin@test.com / admin123');
            console.log('   2. Permitir notificaciones cuando lo pida');
            console.log('   3. El token se registrará automáticamente');
            return;
        }
        
        // 2. Enviar notificación de prueba directa
        console.log('\n📤 Enviando notificación de prueba...');
        const testResponse = await axios.post('http://localhost:3000/test-push', {
            title: '🧪 PRUEBA DIRECTA',
            body: 'Si recibes esto, tu token funciona perfectamente!',
            tokens: [usuario.push_token]
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Notificación enviada');
        
        // 3. Verificar otros tokens admin
        console.log('\n👥 Verificando otros administradores...');
        const Usuario = require('./models/usuario');
        const adminTokens = await Usuario.getAdminPushTokens();
        
        console.log(`📊 Total tokens admin: ${adminTokens.length}`);
        adminTokens.forEach((tokenData, index) => {
            console.log(`   ${index + 1}. ${tokenData.email}: ${tokenData.push_token ? '✅' : '❌'}`);
        });
        
        console.log('\n🎯 RESULTADO:');
        if (usuario.push_token) {
            console.log('✅ Tu token está registrado');
            console.log('📱 Deberías haber recibido la notificación de prueba');
            console.log('🔔 Si no la recibiste, revisa:');
            console.log('   - Permisos de notificación habilitados');
            console.log('   - App en primer plano o segundo plano');
            console.log('   - Conexión de internet estable');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 SOLUCIÓN: El servidor no está funcionando');
            console.log('Ejecutar: npm start');
        }
    }
}

verificarMiToken(); 