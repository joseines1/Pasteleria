const fetch = require('node-fetch');

async function testNotificationsAPI() {
    console.log('🔍 Probando API de notificaciones...');
    
    try {
        // Simular login para obtener token
        console.log('\n1. 🔑 Obteniendo token de autenticación...');
        const loginResponse = await fetch('http://localhost:3001/auth/login', {
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
            console.log('❌ No se pudo obtener token de autenticación');
            return { success: false, error: 'No token available' };
        }
        
        const token = loginData.token;
        console.log('✅ Token obtenido exitosamente');
        
        // Probar endpoint de notificaciones
        console.log('\n2. 📋 Probando endpoint /api/notifications...');
        const notificationsResponse = await fetch('http://localhost:3001/api/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const notificationsData = await notificationsResponse.json();
        console.log('Notifications response status:', notificationsResponse.status);
        console.log('Notifications response:', notificationsData);
        
        if (notificationsResponse.ok && notificationsData.success) {
            console.log(`✅ API de notificaciones funciona: ${notificationsData.notifications?.length || 0} notificaciones`);
            
            // Mostrar algunas notificaciones
            if (notificationsData.notifications && notificationsData.notifications.length > 0) {
                console.log('\n📋 Primeras 3 notificaciones de la API:');
                notificationsData.notifications.slice(0, 3).forEach((notif, index) => {
                    console.log(`   ${index + 1}. ${notif.titulo} (${notif.tipo}) - ${notif.estado}`);
                });
            }
            
            return {
                success: true,
                tokenWorking: true,
                apiWorking: true,
                notificationsCount: notificationsData.notifications?.length || 0,
                notificationsData: notificationsData
            };
        } else {
            console.log('❌ Error en API de notificaciones:', notificationsData);
            return {
                success: false,
                tokenWorking: true,
                apiWorking: false,
                error: notificationsData
            };
        }
        
    } catch (error) {
        console.error('❌ Error probando API:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función para probar también las estadísticas
async function testNotificationsStats() {
    console.log('\n3. 📊 Probando endpoint /api/notifications/stats...');
    
    try {
        // Login
        const loginResponse = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
        });
        const loginData = await loginResponse.json();
        
        if (!loginData.token) {
            console.log('❌ No se pudo obtener token para stats');
            return { success: false };
        }
        
        // Stats
        const statsResponse = await fetch('http://localhost:3001/api/notifications/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const statsData = await statsResponse.json();
        console.log('Stats response:', statsData);
        
        if (statsResponse.ok && statsData.success) {
            console.log(`✅ Estadísticas: Total: ${statsData.stats.total}, No leídas: ${statsData.stats.unread}, Pendientes: ${statsData.stats.pending}`);
            return { success: true, stats: statsData.stats };
        } else {
            console.log('❌ Error en estadísticas:', statsData);
            return { success: false, error: statsData };
        }
        
    } catch (error) {
        console.error('❌ Error probando stats:', error);
        return { success: false, error: error.message };
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    Promise.all([
        testNotificationsAPI(),
        testNotificationsStats()
    ]).then(([apiResult, statsResult]) => {
        console.log('\n🏁 RESUMEN FINAL:');
        console.log('   - API Token: ' + (apiResult.tokenWorking ? '✅' : '❌'));
        console.log('   - API Notificaciones: ' + (apiResult.apiWorking ? '✅' : '❌'));
        console.log('   - API Estadísticas: ' + (statsResult.success ? '✅' : '❌'));
        console.log('   - Notificaciones obtenidas: ' + (apiResult.notificationsCount || 0));
        
        process.exit(apiResult.success && statsResult.success ? 0 : 1);
    }).catch(error => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
} 