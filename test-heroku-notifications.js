const https = require('https');

const HEROKU_URL = 'https://pasteleria-c6865951d4d7.herokuapp.com';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsIm5vbWJyZSI6IlRlc3RVc2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sIjoiZW1wbGVhZG8iLCJpYXQiOjE3Mzc5MDgyNzAsImV4cCI6MTczNzk5NDY3MH0.tIJl5PnL_5oFQN3shnG9_6XkSR4-u4JiSJhSVZSbZ3M';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, HEROKU_URL);
        
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            }
        };

        if (data) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        statusCode: res.statusCode,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testHerokuNotifications() {
    console.log('🧪 PROBANDO NOTIFICACIONES EN HEROKU\n');
    console.log(`🌐 URL: ${HEROKU_URL}`);
    console.log(`🔑 Token: ${TEST_TOKEN.substring(0, 20)}...\n`);

    try {
        // 1. Probar conexión básica
        console.log('🔍 1. Probando conexión básica...');
        const healthCheck = await makeRequest('/health');
        console.log(`   Status: ${healthCheck.statusCode}`);
        console.log(`   Respuesta:`, healthCheck.data);
        console.log('');

        // 2. Probar endpoint de notificaciones
        console.log('🔔 2. Probando endpoint de notificaciones...');
        const notificationsResponse = await makeRequest('/api/notifications');
        console.log(`   Status: ${notificationsResponse.statusCode}`);
        
        if (notificationsResponse.statusCode === 200) {
            console.log('   ✅ Endpoint funcionando!');
            if (notificationsResponse.data.success) {
                console.log(`   📋 Notificaciones encontradas: ${notificationsResponse.data.notifications.length}`);
                
                if (notificationsResponse.data.notifications.length > 0) {
                    console.log('   📝 Primeras 3 notificaciones:');
                    notificationsResponse.data.notifications.slice(0, 3).forEach((notif, index) => {
                        console.log(`      ${index + 1}. ${notif.titulo} (${notif.estado})`);
                    });
                }
            } else {
                console.log('   ❌ Respuesta sin éxito:', notificationsResponse.data);
            }
        } else {
            console.log(`   ❌ Error ${notificationsResponse.statusCode}:`, notificationsResponse.data);
        }
        console.log('');

        // 3. Probar estadísticas
        console.log('📊 3. Probando estadísticas...');
        const statsResponse = await makeRequest('/api/notifications/stats');
        console.log(`   Status: ${statsResponse.statusCode}`);
        
        if (statsResponse.statusCode === 200 && statsResponse.data.success) {
            console.log('   ✅ Estadísticas obtenidas:');
            console.log(`      - Total: ${statsResponse.data.stats.total}`);
            console.log(`      - No leídas: ${statsResponse.data.stats.unread}`);
            console.log(`      - Pendientes: ${statsResponse.data.stats.pending}`);
        } else {
            console.log(`   ❌ Error en estadísticas:`, statsResponse.data);
        }
        console.log('');

        // 4. Crear notificación de prueba
        console.log('🆕 4. Creando notificación de prueba...');
        const customNotif = {
            titulo: '🧪 Prueba desde Script',
            mensaje: 'Esta es una prueba desde el script de Heroku',
            modulo: 'general'
        };
        
        const createResponse = await makeRequest('/api/notifications/custom', 'POST', customNotif);
        console.log(`   Status: ${createResponse.statusCode}`);
        
        if (createResponse.statusCode === 200 && createResponse.data.success) {
            console.log(`   ✅ Notificación creada con ID: ${createResponse.data.notificationId}`);
        } else {
            console.log(`   ❌ Error creando notificación:`, createResponse.data);
        }
        console.log('');

        // 5. Verificar nuevamente las notificaciones
        console.log('🔄 5. Verificando notificaciones actualizadas...');
        const updatedNotifications = await makeRequest('/api/notifications');
        
        if (updatedNotifications.statusCode === 200 && updatedNotifications.data.success) {
            console.log(`   ✅ Total de notificaciones ahora: ${updatedNotifications.data.notifications.length}`);
        }
        console.log('');

        console.log('🎉 ¡PRUEBA COMPLETA!');
        console.log('');
        console.log('📱 Instrucciones para la app móvil:');
        console.log('   1. Abre la app en tu iPhone');
        console.log('   2. Ve a la pestaña 🔔 Notificaciones');
        console.log('   3. Deberías ver las notificaciones listadas');
        console.log('   4. Puedes crear solicitudes personalizadas');
        console.log('   5. Los administradores pueden aprobar/rechazar');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error.message);
    }
}

// Ejecutar la prueba
testHerokuNotifications(); 