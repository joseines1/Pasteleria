const { notificationService } = require('./src/services/notificationService');

// Script para configurar tokens de administradores y resolver notificaciones push
console.log('🔧 === CONFIGURACIÓN DE TOKENS DE ADMINISTRADORES ===\n');

// PASO 1: CONFIGURACIÓN MANUAL DE TOKENS (TEMPORAL)
// =====================================================

console.log('📋 INSTRUCCIONES PARA CONFIGURAR NOTIFICACIONES PUSH:\n');

console.log('1️⃣ OBTENER TOKEN DEL ADMINISTRADOR:');
console.log('   • El administrador debe abrir la app en su celular');
console.log('   • Al iniciar sesión, verá un popup con su token push');
console.log('   • Debe copiar ese token\n');

console.log('2️⃣ CONFIGURAR TOKEN EN EL CÓDIGO:');
console.log('   • Abrir: pasteleria-app/src/services/notificationService.js');
console.log('   • Buscar la línea: const adminTokens = [');
console.log('   • Agregar el token del administrador en el array\n');

console.log('3️⃣ EJEMPLO DE CONFIGURACIÓN:');
console.log('   const adminTokens = [');
console.log('     "ExponentPushToken[abc123def456...]", // Admin María');
console.log('     "ExponentPushToken[xyz789uvw012...]", // Admin Carlos');
console.log('   ];\n');

console.log('⚠️ IMPORTANTE: Este es un método temporal para testing.');
console.log('   En producción, los tokens se guardarían automáticamente en la base de datos.\n');

// FUNCIÓN PARA PROBAR NOTIFICACIONES
async function testPushNotifications() {
  console.log('🧪 === PROBANDO NOTIFICACIONES PUSH ===\n');

  try {
    // Simular empleado enviando solicitud
    console.log('👨‍💼 Simulando empleado enviando solicitud...');
    
    const empleado = {
      id: 2,
      nombre: 'Juan Empleado',
      rol: 'empleado'
    };

    await notificationService.initialize(empleado);

    const solicitud = {
      title: '📋 Solicitud de Prueba - Postre',
      message: `${empleado.nombre} solicita crear el postre "Tarta de Prueba". ¿Aprobar?`,
      module: 'postres',
      data: {
        action: 'crear',
        postre: 'Tarta de Prueba',
        usuario: empleado.nombre,
        rol: empleado.rol,
        requiresApproval: true
      }
    };

    const result = await notificationService.sendCustomNotification(solicitud, empleado.nombre);
    
    if (result.success) {
      console.log('✅ Solicitud enviada exitosamente');
      console.log('📱 El administrador debería recibir una notificación push');
    } else {
      console.log('❌ Error enviando solicitud:', result.error);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// CONFIGURACIÓN AUTOMÁTICA (AVANZADA)
async function setupAutomaticTokens() {
  console.log('🤖 === CONFIGURACIÓN AUTOMÁTICA DE TOKENS ===\n');
  
  console.log('💡 Para configuración automática, necesitas:');
  console.log('   1. Un servidor backend funcionando');
  console.log('   2. Base de datos configurada');
  console.log('   3. Endpoint /auth/push-token operativo\n');
  
  console.log('🔧 Los tokens se guardarán automáticamente cuando:');
  console.log('   • Los administradores abran la app');
  console.log('   • Se registren para push notifications');
  console.log('   • El servidor esté disponible\n');
}

// DIAGNÓSTICO DEL SISTEMA
async function diagnoseNotificationSystem() {
  console.log('🔍 === DIAGNÓSTICO DEL SISTEMA ===\n');

  try {
    // Verificar estado del servicio
    const status = notificationService.getServiceStatus();
    console.log('📊 Estado actual:');
    console.log(`   • Modo: ${status.mode} (${status.isExpoGo ? 'Expo Go' : 'Development Build'})`);
    console.log(`   • Token disponible: ${status.hasToken ? '✅' : '❌'}`);
    console.log(`   • Usuario: ${status.userId} (${status.userRole})`);
    console.log(`   • Listeners activos: ${status.listeners}\n`);

    // Recomendaciones
    console.log('💡 RECOMENDACIONES:');
    
    if (status.isExpoGo) {
      console.log('   ⚠️ Detectado Expo Go:');
      console.log('     - Las notificaciones son solo locales');
      console.log('     - Para notificaciones entre celulares, usar Development Build');
      console.log('     - Comando: expo build:ios o expo build:android\n');
    } else {
      console.log('   ✅ Detectado Development Build:');
      console.log('     - Push notifications habilitadas');
      console.log('     - Configurar tokens de administradores');
      console.log('     - Verificar conexión al servidor\n');
    }

    // Test de notificación
    console.log('🧪 Enviando notificación de prueba...');
    const testResult = await notificationService.sendTestNotification();
    
    if (testResult.success) {
      console.log(`✅ Notificación de prueba enviada (${testResult.mode})`);
    } else {
      console.log(`❌ Error en notificación de prueba: ${testResult.error}`);
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
}

// SOLUCIÓN PASO A PASO
console.log('🚀 === SOLUCIÓN PASO A PASO ===\n');

console.log('PARA RESOLVER LAS NOTIFICACIONES ENTRE CELULARES:\n');

console.log('📱 CELULAR 1 (ADMINISTRADOR):');
console.log('   1. Instalar la app como Development Build (no Expo Go)');
console.log('   2. Hacer login como administrador');
console.log('   3. La app mostrará el token push en un popup');
console.log('   4. Copiar ese token\n');

console.log('💻 EN EL CÓDIGO:');
console.log('   1. Abrir: pasteleria-app/src/services/notificationService.js');
console.log('   2. Encontrar: const adminTokens = []');
console.log('   3. Agregar el token del admin: ["ExponentPushToken[...]"]');
console.log('   4. Guardar el archivo\n');

console.log('📱 CELULAR 2 (EMPLEADO):');
console.log('   1. Hacer login como empleado');
console.log('   2. Intentar crear/editar/eliminar algo');
console.log('   3. Esto enviará una solicitud al administrador\n');

console.log('🔔 VERIFICACIÓN:');
console.log('   • El administrador debe recibir notificación push');
console.log('   • Puede aprobar/rechazar desde su celular');
console.log('   • Las acciones se ejecutan automáticamente\n');

// EJEMPLO DE TOKEN CONFIGURADO
console.log('📋 === EJEMPLO DE CONFIGURACIÓN ===\n');

console.log('// En notificationService.js, línea ~370:');
console.log('const adminTokens = [');
console.log('  "ExponentPushToken[abc123def456ghi789jkl012]", // María Admin');
console.log('  "ExponentPushToken[mno345pqr678stu901vwx234]", // Carlos Admin');
console.log('];\n');

console.log('✅ Con esta configuración, cuando un empleado envíe una solicitud,');
console.log('   se enviará una notificación push a ambos administradores.\n');

// EJECUTAR DIAGNÓSTICO
diagnoseNotificationSystem();

module.exports = {
  testPushNotifications,
  setupAutomaticTokens,
  diagnoseNotificationSystem
}; 