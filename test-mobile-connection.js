const fetch = require('node-fetch');

async function testMobileAppConnection() {
    console.log('📱 Probando conexión desde la perspectiva de la app móvil...');
    
    // Esta es la URL que usará la app móvil
    const MOBILE_API_URL = 'http://192.168.1.74:3001';
    
    try {
        // 1. Probar conexión básica
        console.log('\n1. 🔗 Probando conexión básica...');
        console.log(`   URL: ${MOBILE_API_URL}`);
        
        const healthResponse = await fetch(`${MOBILE_API_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Servidor accesible:', healthData);
        
        // 2. Probar login
        console.log('\n2. 🔑 Probando login desde app móvil...');
        const loginResponse = await fetch(`${MOBILE_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);
        
        if (!loginData.token) {
            console.log('❌ Login falló');
            return { success: false, error: 'Login failed' };
        }
        
        const token = loginData.token;
        console.log('✅ Login exitoso, token obtenido');
        
        // 3. Probar endpoint de notificaciones (exactamente como lo hace la app)
        console.log('\n3. 📋 Probando /api/notifications desde app móvil...');
        const notificationsResponse = await fetch(`${MOBILE_API_URL}/api/notifications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const notificationsData = await notificationsResponse.json();
        console.log('Status:', notificationsResponse.status);
        console.log('Response:', notificationsData);
        
        if (notificationsResponse.ok && notificationsData.success) {
            console.log(`✅ ¡Notificaciones obtenidas exitosamente!`);
            console.log(`📊 Total: ${notificationsData.notifications?.length || 0} notificaciones`);
            
            // Mostrar primeras 3
            if (notificationsData.notifications && notificationsData.notifications.length > 0) {
                console.log('\n📋 Primeras notificaciones:');
                notificationsData.notifications.slice(0, 3).forEach((notif, index) => {
                    console.log(`   ${index + 1}. ${notif.titulo}`);
                });
            }
            
            return {
                success: true,
                url: MOBILE_API_URL,
                notificationsCount: notificationsData.notifications?.length || 0,
                loginWorking: true,
                notificationsWorking: true
            };
        } else {
            console.log('❌ Error obteniendo notificaciones:', notificationsData);
            return {
                success: false,
                url: MOBILE_API_URL,
                loginWorking: true,
                notificationsWorking: false,
                error: notificationsData
            };
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        
        // Verificar si es problema de red
        if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
            console.log('\n🚨 PROBLEMA DETECTADO:');
            console.log('   - El servidor no está accesible desde la red local');
            console.log('   - Posibles soluciones:');
            console.log('     1. Verificar firewall de Windows');
            console.log('     2. Asegurar que el servidor esté bind a 0.0.0.0, no solo localhost');
            console.log('     3. Verificar que el puerto 3001 esté abierto');
        }
        
        return {
            success: false,
            url: MOBILE_API_URL,
            error: error.message,
            connectionRefused: error.code === 'ECONNREFUSED'
        };
    }
}

// Función adicional para probar diferentes configuraciones
async function testAllPossibleUrls() {
    console.log('\n🔍 Probando todas las URLs posibles...');
    
    const urls = [
        'http://192.168.1.74:3001',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
    ];
    
    for (const url of urls) {
        console.log(`\n🎯 Probando: ${url}`);
        try {
            const response = await fetch(`${url}/health`, { timeout: 5000 });
            const data = await response.json();
            console.log(`✅ ${url} - FUNCIONA:`, data.status);
        } catch (error) {
            console.log(`❌ ${url} - ERROR:`, error.message);
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    Promise.all([
        testMobileAppConnection(),
        testAllPossibleUrls()
    ]).then(([mainResult, urlResults]) => {
        console.log('\n🏁 RESUMEN FINAL:');
        console.log('   - URL configurada:', mainResult.url);
        console.log('   - Conexión:', mainResult.success ? '✅' : '❌');
        console.log('   - Login:', mainResult.loginWorking ? '✅' : '❌');
        console.log('   - Notificaciones:', mainResult.notificationsWorking ? '✅' : '❌');
        console.log('   - Total notificaciones:', mainResult.notificationsCount || 0);
        
        if (mainResult.success) {
            console.log('\n🎉 ¡La app móvil debería funcionar correctamente!');
        } else {
            console.log('\n🚨 La app móvil tiene problemas de conexión');
            if (mainResult.connectionRefused) {
                console.log('💡 Solución: Verificar configuración de red del servidor');
            }
        }
        
        process.exit(mainResult.success ? 0 : 1);
    }).catch(error => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
} 