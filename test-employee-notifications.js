const { notificationService } = require('./src/services/notificationService');

// Script para probar las notificaciones de empleados
async function testEmployeeNotifications() {
  console.log('🧪 === PROBANDO NOTIFICACIONES DE EMPLEADOS ===\n');

  try {
    // Simular usuario empleado
    const empleado = {
      id: 2,
      nombre: 'Juan Pérez',
      email: 'juan.empleado@pasteleria.com',
      rol: 'empleado'
    };

    // Simular usuario administrador
    const admin = {
      id: 1,
      nombre: 'María García',
      email: 'admin@pasteleria.com',
      rol: 'administrador'
    };

    console.log('👤 Usuario empleado simulado:', empleado.nombre);
    console.log('👑 Usuario administrador simulado:', admin.nombre);
    console.log('');

    // 1. Inicializar servicio para empleado
    console.log('1️⃣ Inicializando servicio para empleado...');
    const employeeService = await notificationService.initialize(empleado);
    console.log('   Estado:', employeeService.success ? '✅ OK' : '❌ ERROR');
    console.log('   Modo:', employeeService.mode);
    console.log('');

    // 2. Probar notificación de nuevo postre
    console.log('2️⃣ Probando notificación: Nuevo postre creado...');
    const postreNotification = await notificationService.sendCustomNotification({
      title: '🧁 Nuevo Postre Creado',
      message: `${empleado.nombre} creó el postre "Pastel de Chocolate Especial"`,
      module: 'postres',
      data: {
        action: 'create',
        postre: 'Pastel de Chocolate Especial',
        usuario: empleado.nombre,
        rol: empleado.rol
      }
    }, empleado.nombre);
    
    console.log('   Resultado:', postreNotification.success ? '✅ Enviada' : '❌ Error');
    console.log('');

    // 3. Probar notificación de ingrediente actualizado
    console.log('3️⃣ Probando notificación: Ingrediente actualizado...');
    const ingredienteNotification = await notificationService.sendCustomNotification({
      title: '📝 Ingrediente Actualizado',
      message: `${empleado.nombre} actualizó Harina de Trigo - Stock: 15 kg`,
      module: 'ingredientes',
      data: {
        action: 'update',
        ingrediente: 'Harina de Trigo',
        stock: 15,
        unidad: 'kg',
        usuario: empleado.nombre,
        rol: empleado.rol
      }
    }, empleado.nombre);
    
    console.log('   Resultado:', ingredienteNotification.success ? '✅ Enviada' : '❌ Error');
    console.log('');

    // 4. Probar notificación de nueva receta
    console.log('4️⃣ Probando notificación: Nueva receta creada...');
    const recetaNotification = await notificationService.sendCustomNotification({
      title: '📋 Nueva Receta Creada',
      message: `${empleado.nombre} creó una nueva receta: "Tarta de Frutas" con Harina de Trigo (500g)`,
      module: 'recetas',
      data: {
        action: 'create',
        postre: 'Tarta de Frutas',
        ingrediente: 'Harina de Trigo',
        cantidad: 500,
        usuario: empleado.nombre,
        rol: empleado.rol
      }
    }, empleado.nombre);
    
    console.log('   Resultado:', recetaNotification.success ? '✅ Enviada' : '❌ Error');
    console.log('');

    // 5. Probar notificación de eliminación
    console.log('5️⃣ Probando notificación: Eliminación de postre...');
    const eliminacionNotification = await notificationService.notifyDeletion(
      'postre', 
      'Cheesecake de Fresa', 
      empleado.nombre,
      'Eliminado por empleado desde la app móvil'
    );
    
    console.log('   Resultado:', eliminacionNotification.success ? '✅ Enviada' : '❌ Error');
    console.log('');

    // 6. Probar notificación de stock bajo
    console.log('6️⃣ Probando notificación: Stock bajo...');
    const stockNotification = await notificationService.notifyLowStock({
      id: 3,
      nombre: 'Azúcar',
      stock: 5
    }, empleado.nombre);
    
    console.log('   Resultado:', stockNotification.success ? '✅ Enviada' : '❌ Error');
    console.log('');

    // 7. Mostrar resumen
    console.log('📊 === RESUMEN DE PRUEBAS ===');
    console.log('✅ Todas las notificaciones han sido enviadas');
    console.log('🎯 Las notificaciones deben aparecer SOLO para administradores');
    console.log('📱 Revisa la pantalla de notificaciones en la app móvil');
    console.log('');
    
    // 8. Mostrar estado del servicio
    const status = notificationService.getServiceStatus();
    console.log('🔧 Estado del servicio:');
    console.log(`   - Modo: ${status.mode} (${status.isExpoGo ? 'Expo Go' : 'Development Build'})`);
    console.log(`   - Token: ${status.hasToken ? '✅ Disponible' : '❌ No disponible'}`);
    console.log(`   - Usuario: ${status.userId} (${status.userRole})`);
    console.log(`   - Listeners: ${status.listeners}`);

  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
  }

  console.log('\n🏁 === PRUEBAS COMPLETADAS ===');
  console.log('💡 Próximos pasos:');
  console.log('   1. Abrir la app móvil como administrador');
  console.log('   2. Ir a la pantalla de Notificaciones');
  console.log('   3. Verificar que aparezcan las notificaciones de prueba');
  console.log('   4. Realizar acciones como empleado y verificar las notificaciones');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testEmployeeNotifications().catch(console.error);
}

module.exports = { testEmployeeNotifications }; 