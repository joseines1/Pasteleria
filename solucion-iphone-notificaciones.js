const axios = require('axios');

async function diagnosticoiPhone() {
    console.log('📱 DIAGNÓSTICO ESPECÍFICO PARA iPHONES\n');
    console.log('=====================================\n');
    
    try {
        // Verificar servidor
        console.log('1️⃣ Verificando servidor...');
        await axios.get('http://localhost:3000/test');
        console.log('✅ Servidor funcionando\n');
        
        // Verificar tokens actuales
        console.log('2️⃣ Verificando tokens actuales...');
        const adminLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        const empleadoLogin = await axios.post('http://localhost:3000/auth/login', {
            email: 'empleado@test.com',
            password: 'emp123'
        });
        
        console.log('📊 ESTADO ACTUAL:');
        console.log(`👑 Admin token: ${adminLogin.data.usuario.pushToken || 'NO REGISTRADO'}`);
        console.log(`👤 Empleado token: ${empleadoLogin.data.usuario.pushToken || 'NO REGISTRADO'}\n`);
        
        console.log('🍎 PROBLEMAS ESPECÍFICOS DE iPHONE:');
        console.log('===================================');
        console.log('❌ 1. Configuración de notificaciones más estricta');
        console.log('❌ 2. Permisos de notificación por app');
        console.log('❌ 3. Modo "No molestar" o "Focus"');
        console.log('❌ 4. Configuración de Expo Go específica');
        console.log('❌ 5. iOS requiere certificados específicos\n');
        
        console.log('🔧 SOLUCIÓN PASO A PASO PARA iPHONE:');
        console.log('====================================');
        console.log('');
        console.log('📱 PASO 1: CONFIGURAR iPHONE ADMINISTRADOR');
        console.log('------------------------------------------');
        console.log('1. Abrir Expo Go en iPhone');
        console.log('2. ⚠️  IMPORTANTE: Permitir ubicación si se solicita');
        console.log('3. Escanear QR del metro bundler');
        console.log('4. Esperar carga completa (sin errores)');
        console.log('5. Login: admin@test.com / admin123');
        console.log('6. 🔔 CRÍTICO: Cuando aparezca popup de notificaciones:');
        console.log('   - Tocar "Permitir" (Allow)');
        console.log('   - NO tocar "No permitir" o "Don\'t Allow"');
        console.log('7. 🏠 Minimizar app (botón home)');
        console.log('8. ✅ Verificar en Ajustes > Notificaciones > Expo Go:');
        console.log('   - Permitir notificaciones: ON');
        console.log('   - Alertas: ON');
        console.log('   - Sonidos: ON');
        console.log('   - Distintivos: ON\n');
        
        console.log('📱 PASO 2: CONFIGURAR iPHONE EMPLEADO');
        console.log('------------------------------------');
        console.log('1. Abrir Expo Go en iPhone empleado');
        console.log('2. Escanear EL MISMO QR del metro bundler');
        console.log('3. Esperar carga completa');
        console.log('4. Login: empleado@test.com / emp123');
        console.log('5. Mantener app abierta\n');
        
        console.log('⚙️  PASO 3: VERIFICAR CONFIGURACIÓN iOS');
        console.log('---------------------------------------');
        console.log('En el iPhone ADMINISTRADOR:');
        console.log('1. Ajustes > Notificaciones');
        console.log('2. Buscar "Expo Go"');
        console.log('3. Verificar que esté activado:');
        console.log('   ✅ Permitir notificaciones');
        console.log('   ✅ Alertas');
        console.log('   ✅ Sonidos');
        console.log('   ✅ Distintivos');
        console.log('   ✅ Mostrar en pantalla de bloqueo');
        console.log('   ✅ Mostrar en centro de notificaciones\n');
        
        console.log('🔄 PASO 4: VERIFICAR MODO NO MOLESTAR');
        console.log('------------------------------------');
        console.log('1. Deslizar desde esquina superior derecha');
        console.log('2. Verificar que "No molestar" esté DESACTIVADO');
        console.log('3. Verificar que "Focus" esté desactivado');
        console.log('4. Si está activado, desactivarlo temporalmente\n');
        
        console.log('🧪 PASO 5: PROBAR NOTIFICACIONES');
        console.log('--------------------------------');
        console.log('1. iPhone admin: App en segundo plano');
        console.log('2. iPhone empleado: Crear ingrediente');
        console.log('3. Esperar 5-10 segundos');
        console.log('4. iPhone admin: Debería recibir notificación\n');
        
        console.log('🚨 SI AÚN NO FUNCIONA - SOLUCIÓN AVANZADA:');
        console.log('==========================================');
        console.log('1. 🔄 REINSTALAR EXPO GO:');
        console.log('   - Eliminar Expo Go del iPhone');
        console.log('   - Reinstalar desde App Store');
        console.log('   - Repetir configuración\n');
        
        console.log('2. 🔧 RESETEAR PERMISOS:');
        console.log('   - Ajustes > General > Transferir o restablecer iPhone');
        console.log('   - Restablecer ubicación y privacidad');
        console.log('   - Reconfigurar Expo Go\n');
        
        console.log('3. 📶 VERIFICAR RED:');
        console.log('   - Ambos iPhones en misma WiFi');
        console.log('   - Desactivar datos móviles temporalmente');
        console.log('   - Usar solo WiFi\n');
        
        // Crear ingrediente de prueba
        console.log('🧪 CREANDO INGREDIENTE DE PRUEBA...');
        if (empleadoLogin.data.token) {
            try {
                const ingrediente = await axios.post('http://localhost:3000/ingredientes', {
                    nombre: 'Test iPhone Notificación',
                    cantidad: 1,
                    unidad: 'kg'
                }, {
                    headers: {
                        'Authorization': `Bearer ${empleadoLogin.data.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (ingrediente.data.success) {
                    console.log('✅ Ingrediente creado - Notificación enviada');
                    console.log('📱 Revisa el iPhone administrador AHORA');
                    
                    // Limpiar
                    setTimeout(async () => {
                        await axios.delete(`http://localhost:3000/ingredientes/${ingrediente.data.idIngrediente}`, {
                            headers: { 'Authorization': `Bearer ${empleadoLogin.data.token}` }
                        });
                        console.log('🧹 Ingrediente de prueba eliminado');
                    }, 2000);
                }
            } catch (error) {
                console.log('❌ Error creando ingrediente de prueba');
            }
        }
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error.message);
    }
}

diagnosticoiPhone(); 