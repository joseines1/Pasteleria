const { Expo } = require('expo-server-sdk');
const Usuario = require('./models/usuario');

async function solucionNotificacionesMovil() {
    console.log('🔧 SOLUCIÓN COMPLETA PARA NOTIFICACIONES MÓVILES');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar estado actual
        console.log('\n1️⃣  VERIFICANDO ESTADO ACTUAL...');
        const userTokens = await Usuario.getAdminPushTokens();
        console.log(`📊 Tokens en base de datos: ${userTokens.length}`);
        
        if (userTokens.length === 0) {
            console.log('✅ Base de datos limpia - Sin tokens problemáticos');
        } else {
            console.log('⚠️  Tokens encontrados:');
            userTokens.forEach((token, index) => {
                console.log(`   ${index + 1}. ${token.substring(0, 30)}...`);
            });
        }
        
        // 2. Explicar el problema específico
        console.log('\n2️⃣  PROBLEMA IDENTIFICADO:');
        console.log('❌ Los tokens se generan pero NO se registran con Expo');
        console.log('❌ Error: "not a registered push notification recipient"');
        console.log('❌ Esto indica un problema de configuración en la app móvil');
        
        // 3. Soluciones específicas
        console.log('\n3️⃣  SOLUCIONES ESPECÍFICAS:');
        console.log('');
        console.log('🔧 OPCIÓN 1: REGENERAR TOKEN COMPLETAMENTE');
        console.log('   1. En el celular, ve a Configuración → Aplicaciones');
        console.log('   2. Busca tu app de pastelería');
        console.log('   3. Toca "Almacenamiento" → "Borrar datos" (o "Limpiar caché")');
        console.log('   4. Toca "Permisos" → Desactiva "Notificaciones"');
        console.log('   5. Espera 10 segundos');
        console.log('   6. Activa "Notificaciones" nuevamente');
        console.log('   7. Abre la app e inicia sesión');
        console.log('   8. ACEPTA los permisos de notificación cuando aparezcan');
        
        console.log('\n🔧 OPCIÓN 2: VERIFICAR CONFIGURACIÓN DE EXPO');
        console.log('   1. Asegúrate de que la app esté compilada con Expo SDK');
        console.log('   2. Verifica que el proyecto tenga expo-notifications instalado');
        console.log('   3. Confirma que se esté usando el projectId correcto de Expo');
        
        console.log('\n🔧 OPCIÓN 3: FORZAR NUEVO REGISTRO');
        console.log('   1. Desinstala completamente la app del celular');
        console.log('   2. Reinicia el dispositivo');
        console.log('   3. Vuelve a instalar la app');
        console.log('   4. Al abrir por primera vez, acepta TODOS los permisos');
        console.log('   5. Inicia sesión inmediatamente');
        
        // 4. Verificaciones técnicas
        console.log('\n4️⃣  VERIFICACIONES TÉCNICAS NECESARIAS:');
        console.log('');
        console.log('📱 EN LA APP MÓVIL (Código):');
        console.log('   □ ¿Está usando expo-notifications?');
        console.log('   □ ¿Se está llamando a registerForPushNotificationsAsync()?');
        console.log('   □ ¿Se está enviando el token al servidor después de generarlo?');
        console.log('   □ ¿El projectId de Expo es correcto?');
        
        console.log('\n🔧 EN EL SERVIDOR (Este proyecto):');
        console.log('   □ ¿Se está usando el Expo SDK correcto?');
        console.log('   □ ¿Los tokens se guardan correctamente en la BD?');
        console.log('   □ ¿Se está validando el formato del token?');
        
        // 5. Script de prueba mejorado
        console.log('\n5️⃣  SCRIPT DE PRUEBA MEJORADO:');
        
        if (userTokens.length > 0) {
            console.log('\n🧪 PROBANDO TOKENS ACTUALES...');
            
            const expo = new Expo();
            const validTokens = userTokens.filter(token => Expo.isExpoPushToken(token));
            
            if (validTokens.length > 0) {
                console.log(`✅ Tokens con formato válido: ${validTokens.length}`);
                
                // Probar con configuración diferente
                const testMessage = {
                    to: validTokens[0],
                    sound: 'default',
                    title: '🔧 Prueba de Configuración',
                    body: 'Probando con configuración mejorada',
                    data: { test: true },
                    priority: 'high',
                    channelId: 'default'
                };
                
                try {
                    const tickets = await expo.sendPushNotificationsAsync([testMessage]);
                    console.log('📤 Resultado de prueba:', tickets[0]);
                    
                    if (tickets[0].status === 'error') {
                        console.log('❌ Error confirmado:', tickets[0].message);
                        
                        if (tickets[0].message.includes('not a registered push notification recipient')) {
                            console.log('\n🚨 CONFIRMADO: Token no registrado con Expo');
                            console.log('💡 SOLUCIÓN: El usuario DEBE seguir las opciones 1 o 3 arriba');
                        }
                    }
                } catch (error) {
                    console.log('❌ Error en prueba:', error.message);
                }
            }
        }
        
        // 6. Pasos inmediatos para el usuario
        console.log('\n6️⃣  PASOS INMEDIATOS PARA EL USUARIO:');
        console.log('');
        console.log('🎯 ACCIÓN REQUERIDA AHORA:');
        console.log('   1. Toma tu celular');
        console.log('   2. Ve a Configuración → Aplicaciones → [Tu App]');
        console.log('   3. Toca "Permisos" → Desactiva "Notificaciones"');
        console.log('   4. Espera 10 segundos');
        console.log('   5. Activa "Notificaciones" nuevamente');
        console.log('   6. Abre la app');
        console.log('   7. Cierra sesión si estás logueado');
        console.log('   8. Inicia sesión nuevamente');
        console.log('   9. ACEPTA los permisos cuando aparezcan');
        console.log('   10. Ejecuta: node debug-push-tokens.js');
        
        // 7. Qué esperar
        console.log('\n7️⃣  QUÉ ESPERAR:');
        console.log('✅ Deberías ver un token DIFERENTE al anterior');
        console.log('✅ El nuevo token debería funcionar correctamente');
        console.log('✅ Las notificaciones deberían llegar al celular');
        
        console.log('\n' + '=' .repeat(60));
        console.log('🎯 RESUMEN: El problema es que el token no se registra con Expo');
        console.log('🔧 SOLUCIÓN: Regenerar completamente los permisos y el token');
        console.log('⏰ TIEMPO ESTIMADO: 2-3 minutos siguiendo los pasos');
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

// Ejecutar solución
solucionNotificacionesMovil(); 