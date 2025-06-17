const axios = require('axios');

async function enviarNotificacionPruebaDirecta() {
    console.log('🧪 TEST DIRECTO DE NOTIFICACIÓN PARA iPHONE\n');
    
    try {
        // 1. Obtener tokens de administradores
        console.log('1️⃣ Obteniendo tokens de administradores...');
        
        const adminLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        if (!adminLogin.data.usuario.pushToken) {
            console.log('❌ ADMINISTRADOR NO TIENE TOKEN PUSH');
            console.log('📱 SOLUCIÓN: El admin debe loguearse en la app móvil iPhone');
            console.log('🔔 Y PERMITIR notificaciones cuando se solicite');
            return;
        }
        
        const adminToken = adminLogin.data.usuario.pushToken;
        console.log(`✅ Token admin encontrado: ${adminToken.substring(0, 20)}...`);
        
        // 2. Enviar notificación directa usando Expo API
        console.log('\n2️⃣ Enviando notificación de prueba directa...');
        
        const notificationData = {
            to: adminToken,
            title: '🧪 TEST iPhone Notificación',
            body: '¡Esta es una prueba directa para iPhone!',
            data: {
                tipo: 'test',
                timestamp: new Date().toISOString()
            },
            sound: 'default',
            badge: 1,
            priority: 'high'
        };
        
        const expoResponse = await axios.post('https://exp.host/--/api/v2/push/send', notificationData, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📤 Respuesta de Expo:', expoResponse.data);
        
        if (expoResponse.data.data && expoResponse.data.data[0] && expoResponse.data.data[0].status === 'ok') {
            console.log('\n✅ NOTIFICACIÓN ENVIADA EXITOSAMENTE');
            console.log('📱 Revisa el iPhone administrador AHORA');
            console.log('⏰ La notificación debería aparecer en 5-10 segundos');
            console.log('');
            console.log('🔍 Si NO recibiste la notificación:');
            console.log('1. 📱 Verificar Ajustes > Notificaciones > Expo Go');
            console.log('2. 🔇 Verificar que "No molestar" esté DESACTIVADO');
            console.log('3. 🏠 Verificar que la app esté en segundo plano');
            console.log('4. 📶 Verificar conexión WiFi');
        } else {
            console.log('\n❌ ERROR AL ENVIAR NOTIFICACIÓN');
            console.log('Respuesta:', expoResponse.data);
            
            if (expoResponse.data.data && expoResponse.data.data[0] && expoResponse.data.data[0].details) {
                console.log('Detalles del error:', expoResponse.data.data[0].details);
                
                if (expoResponse.data.data[0].details.error === 'DeviceNotRegistered') {
                    console.log('\n🔧 SOLUCIÓN:');
                    console.log('1. El token no es válido o expiró');
                    console.log('2. Reinstalar Expo Go en el iPhone');
                    console.log('3. Volver a hacer login en la app');
                    console.log('4. Permitir notificaciones nuevamente');
                }
            }
        }
        
        // 3. También probar con el método interno del servidor
        console.log('\n3️⃣ Probando notificación usando método interno del servidor...');
        
        const empleadoLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'empleado@test.com',
            password: 'emp123'
        });
        
        if (empleadoLogin.data.token) {
            try {
                const ingrediente = await axios.post('http://localhost:3000/ingredientes', {
                    nombre: 'Test iPhone Notif Server',
                    cantidad: 1,
                    unidad: 'test'
                }, {
                    headers: {
                        'Authorization': `Bearer ${empleadoLogin.data.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (ingrediente.data.success) {
                    console.log('✅ Ingrediente creado via servidor - Notificación enviada');
                    console.log('📱 También revisa si llegó esta segunda notificación');
                    
                    // Limpiar después de 3 segundos
                    setTimeout(async () => {
                        try {
                            await axios.delete(`http://localhost:3000/ingredientes/${ingrediente.data.idIngrediente}`, {
                                headers: { 'Authorization': `Bearer ${empleadoLogin.data.token}` }
                            });
                            console.log('🧹 Ingrediente de prueba eliminado');
                        } catch (e) {
                            console.log('ℹ️  Ingrediente ya eliminado o error limpiando');
                        }
                    }, 3000);
                }
            } catch (error) {
                console.log('❌ Error creando ingrediente para prueba interna');
            }
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
        if (error.response) {
            console.error('Detalles:', error.response.data);
        }
    }
}

enviarNotificacionPruebaDirecta(); 