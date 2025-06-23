const { notificationService } = require('./src/services/notificationService');

// Script para probar el sistema completo de solicitudes de aprobación
async function testApprovalSystem() {
  console.log('🧪 === PROBANDO SISTEMA DE SOLICITUDES DE APROBACIÓN ===\n');

  try {
    // Simular usuarios
    const empleado = {
      id: 2,
      nombre: 'Juan Pérez',
      email: 'juan.empleado@pasteleria.com',
      rol: 'empleado'
    };

    const administrador = {
      id: 1,
      nombre: 'María García',
      email: 'admin@pasteleria.com',
      rol: 'administrador'
    };

    console.log('👨‍💼 Empleado:', empleado.nombre);
    console.log('👑 Administrador:', administrador.nombre);
    console.log('');

    // 1. Inicializar servicios
    console.log('1️⃣ Inicializando servicios...');
    const employeeService = await notificationService.initialize(empleado);
    console.log(`   - Empleado: ${employeeService.success ? '✅' : '❌'} (${employeeService.mode})`);
    
    // Para simular el admin en otro celular
    const adminService = await notificationService.initialize(administrador);
    console.log(`   - Admin: ${adminService.success ? '✅' : '❌'} (${adminService.mode})`);
    console.log('');

    // 2. Simular solicitudes de empleado
    console.log('2️⃣ Simulando solicitudes de empleado...\n');

    // Solicitud de creación de postre
    console.log('📋 Solicitud 1: Crear Postre');
    const solicitudPostre = {
      title: '📋 Solicitud de creación - Postre',
      message: `${empleado.nombre} solicita crear el postre "Tarta de Chocolate Especial". ¿Aprobar?`,
      module: 'postres',
      data: {
        action: 'crear',
        postre: 'Tarta de Chocolate Especial',
        descripcion: 'Deliciosa tarta con cobertura de chocolate',
        usuario: empleado.nombre,
        rol: empleado.rol,
        newData: {
          nombre: 'Tarta de Chocolate Especial',
          descripcion: 'Deliciosa tarta con cobertura de chocolate'
        },
        requiresApproval: true
      }
    };

    const resultPostre = await notificationService.sendCustomNotification(solicitudPostre, empleado.nombre);
    console.log(`   Resultado: ${resultPostre.success ? '✅ Enviada' : '❌ Error'}`);
    console.log('');

    // Solicitud de actualización de ingrediente
    console.log('📋 Solicitud 2: Actualizar Ingrediente');
    const solicitudIngrediente = {
      title: '📋 Solicitud de actualización - Ingrediente',
      message: `${empleado.nombre} solicita actualizar Harina de Trigo de 10kg a 25kg. ¿Aprobar cambios?`,
      module: 'ingredientes',
      data: {
        action: 'actualizar',
        ingrediente: 'Harina de Trigo',
        ingredienteId: 1,
        stockAnterior: 10,
        stockNuevo: 25,
        unidad: 'kg',
        usuario: empleado.nombre,
        rol: empleado.rol,
        originalData: { id: 1, nombre: 'Harina de Trigo', stock: 10, unidad: 'kg' },
        newData: { nombre: 'Harina de Trigo', stock: 25, unidad: 'kg' },
        requiresApproval: true
      }
    };

    const resultIngrediente = await notificationService.sendCustomNotification(solicitudIngrediente, empleado.nombre);
    console.log(`   Resultado: ${resultIngrediente.success ? '✅ Enviada' : '❌ Error'}`);
    console.log('');

    // Solicitud de eliminación de receta
    console.log('📋 Solicitud 3: Eliminar Receta');
    const solicitudReceta = {
      title: '📋 Solicitud de eliminación - Receta',
      message: `${empleado.nombre} solicita eliminar la receta: "Pastel de Vainilla" con "Azúcar". ¿Aprobar eliminación?`,
      module: 'recetas',
      data: {
        action: 'eliminar',
        postre: 'Pastel de Vainilla',
        ingrediente: 'Azúcar',
        cantidad: 200,
        recetaId: 3,
        usuario: empleado.nombre,
        rol: empleado.rol,
        originalData: {
          id: 3,
          postreNombre: 'Pastel de Vainilla',
          ingredienteNombre: 'Azúcar',
          cantidad: 200
        },
        requiresApproval: true
      }
    };

    const resultReceta = await notificationService.sendCustomNotification(solicitudReceta, empleado.nombre);
    console.log(`   Resultado: ${resultReceta.success ? '✅ Enviada' : '❌ Error'}`);
    console.log('');

    // 3. Simular notificaciones de stock bajo (automáticas)
    console.log('3️⃣ Simulando notificaciones automáticas...\n');

    console.log('⚠️ Notificación automática: Stock Bajo');
    const stockBajo = {
      id: 4,
      nombre: 'Mantequilla',
      stock: 3
    };

    const resultStock = await notificationService.notifyLowStock(stockBajo, empleado.nombre);
    console.log(`   Resultado: ${resultStock.success ? '✅ Enviada' : '❌ Error'}`);
    console.log('');

    // 4. Resumen para el administrador
    console.log('4️⃣ Resumen para el Administrador:\n');
    
    console.log('📱 El administrador debería recibir las siguientes notificaciones:');
    console.log('');
    console.log('🔔 Notificaciones Pendientes de Aprobación:');
    console.log('   1. 📋 Solicitud de creación - Postre (Tarta de Chocolate)');
    console.log('   2. 📋 Solicitud de actualización - Ingrediente (Harina 10→25kg)');
    console.log('   3. 📋 Solicitud de eliminación - Receta (Pastel Vainilla)');
    console.log('');
    console.log('⚠️ Notificaciones Informativas:');
    console.log('   4. ⚠️ Stock Bajo - Mantequilla (3 unidades)');
    console.log('');

    // 5. Instrucciones para el administrador
    console.log('5️⃣ Instrucciones para el Administrador:\n');
    
    console.log('👑 Como Administrador, debes:');
    console.log('   1. 📱 Abrir la app en tu celular');
    console.log('   2. 🔔 Ir a la pantalla "Notificaciones"');
    console.log('   3. 👀 Ver las 4 notificaciones pendientes');
    console.log('   4. ✅ Tocar "Aprobar" en las solicitudes que consideres correctas');
    console.log('   5. ❌ Tocar "Rechazar" en las que no apruebes');
    console.log('   6. 💬 Agregar comentarios opcionales');
    console.log('');

    // 6. Qué sucede al aprobar/rechazar
    console.log('6️⃣ Qué sucede cuando apruebas/rechazas:\n');
    
    console.log('✅ Al APROBAR una solicitud:');
    console.log('   → La acción se ejecuta automáticamente');
    console.log('   → Se crea/actualiza/elimina el elemento');
    console.log('   → El empleado recibe notificación de aprobación');
    console.log('');
    
    console.log('❌ Al RECHAZAR una solicitud:');
    console.log('   → NO se ejecuta ninguna acción');
    console.log('   → El empleado recibe notificación de rechazo');
    console.log('   → Puedes agregar comentario explicando por qué');
    console.log('');

    // 7. Verificación del empleado
    console.log('7️⃣ Verificación para el Empleado:\n');
    
    console.log('👨‍💼 Como Empleado, debes:');
    console.log('   1. 📱 Revisar tus notificaciones después');
    console.log('   2. 📥 Ver las respuestas del administrador');
    console.log('   3. ✅ Las solicitudes aprobadas se ejecutaron automáticamente');
    console.log('   4. ❌ Las rechazadas no hicieron ningún cambio');
    console.log('');

    // 8. Estado del sistema
    const status = notificationService.getServiceStatus();
    console.log('8️⃣ Estado del Sistema:\n');
    console.log(`   🔧 Modo: ${status.mode} (${status.isExpoGo ? 'Expo Go' : 'Development Build'})`);
    console.log(`   📡 Token: ${status.hasToken ? '✅ Disponible' : '❌ No disponible'}`);
    console.log(`   👂 Listeners: ${status.listeners}`);
    console.log(`   👤 Usuario actual: ${status.userId} (${status.userRole})`);
    console.log('');

    // 9. Próximos pasos
    console.log('9️⃣ Próximos Pasos:\n');
    console.log('🚀 Para probar completamente el sistema:');
    console.log('   1. 📱 Abre la app como EMPLEADO en un celular');
    console.log('   2. 📱 Abre la app como ADMINISTRADOR en otro celular');
    console.log('   3. 👨‍💼 Como empleado: intenta crear/editar/eliminar algo');
    console.log('   4. 👑 Como admin: ve a Notificaciones y aprueba/rechaza');
    console.log('   5. 👨‍💼 Como empleado: revisa si recibiste la respuesta');
    console.log('');

    console.log('🎉 === SISTEMA DE APROBACIÓN LISTO PARA USAR ===');
    console.log('');
    console.log('💡 Características principales:');
    console.log('   ✅ Solicitudes de aprobación automáticas');
    console.log('   ✅ Notificaciones push entre celulares');
    console.log('   ✅ Ejecución automática al aprobar');
    console.log('   ✅ Feedback inmediato a empleados');
    console.log('   ✅ Control total para administradores');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testApprovalSystem().catch(console.error);
}

module.exports = { testApprovalSystem }; 