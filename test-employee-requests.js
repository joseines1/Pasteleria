const { apiService } = require('./src/services/apiService');

// === SCRIPT DE PRUEBA: EMPLEADO ENVIANDO SOLICITUDES ===
// Este script simula un empleado enviando solicitudes que llegarán a administradores en otros iPhones

console.log('👨‍💼 === PRUEBA DE SOLICITUDES DE EMPLEADO ===\n');

// Configurar URL base para tu servidor
const API_BASE_URL = 'https://pasteleria-c6865951d4d7.herokuapp.com';
// Para servidor local usar: 'http://localhost:3000'

async function configurarEmpleado() {
  try {
    console.log('🔐 Configurando empleado de prueba...');
    
    // Simular login de empleado
    const empleadoData = {
      email: 'empleado@pasteleria.com',
      password: 'empleado123'
    };

    // Configurar API service
    apiService.setBaseUrl(API_BASE_URL);
    
    const loginResult = await apiService.login(empleadoData.email, empleadoData.password);
    
    if (loginResult.success) {
      console.log('✅ Empleado autenticado:', loginResult.user.nombre);
      return { success: true, empleado: loginResult.user };
    } else {
      throw new Error('Error en login: ' + loginResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error configurando empleado:', error.message);
    return { success: false, error: error.message };
  }
}

async function enviarSolicitudCrearIngrediente(empleado) {
  try {
    console.log('\n📦 === SOLICITUD: CREAR INGREDIENTE ===');
    
    const solicitud = {
      titulo: '➕ Solicitud: Crear Ingrediente',
      mensaje: `${empleado.nombre} solicita crear el ingrediente "Chocolate Premium Belga"`,
      modulo: 'ingredientes',
      tipo: 'solicitud',
      usuario_solicitante_nombre: empleado.nombre,
      requiere_aprobacion: true,
      datos_adicionales: {
        accion: 'crear',
        datos_objeto: {
          nombre: 'Chocolate Premium Belga',
          stock: 500,
          unidad: 'g',
          precio: 15.50
        },
        action_type: 'create_ingrediente',
        solicitante_id: empleado.id,
        solicitante_nombre: empleado.nombre,
        timestamp: new Date().toISOString()
      }
    };

    const resultado = await apiService.makeRequest('/api/notifications/approval-request', {
      method: 'POST',
      body: JSON.stringify(solicitud)
    });

    console.log('✅ Solicitud enviada exitosamente:', resultado);
    console.log('📱 Los administradores deberían recibir una push notification');
    
  } catch (error) {
    console.error('❌ Error enviando solicitud:', error.message);
  }
}

async function enviarSolicitudEditarPostre(empleado) {
  try {
    console.log('\n🍰 === SOLICITUD: EDITAR POSTRE ===');
    
    const solicitud = {
      titulo: '✏️ Solicitud: Editar Postre',
      mensaje: `${empleado.nombre} solicita editar el postre "Tarta de Fresa" - cambiar precio`,
      modulo: 'postres',
      tipo: 'solicitud',
      usuario_solicitante_nombre: empleado.nombre,
      requiere_aprobacion: true,
      datos_adicionales: {
        accion: 'editar',
        datos_objeto: {
          id: 1,
          nombre: 'Tarta de Fresa',
          precio_actual: 20.00,
          precio_nuevo: 25.99,
          motivo: 'Aumento de costos de ingredientes'
        },
        action_type: 'update_postre',
        solicitante_id: empleado.id,
        solicitante_nombre: empleado.nombre,
        timestamp: new Date().toISOString()
      }
    };

    const resultado = await apiService.makeRequest('/api/notifications/approval-request', {
      method: 'POST',
      body: JSON.stringify(solicitud)
    });

    console.log('✅ Solicitud enviada exitosamente:', resultado);
    console.log('📱 Los administradores deberían recibir una push notification');
    
  } catch (error) {
    console.error('❌ Error enviando solicitud:', error.message);
  }
}

async function enviarSolicitudEliminarReceta(empleado) {
  try {
    console.log('\n🗑️ === SOLICITUD: ELIMINAR RECETA ===');
    
    const solicitud = {
      titulo: '🗑️ Solicitud: Eliminar Receta',
      mensaje: `${empleado.nombre} solicita eliminar la receta "Brownie Simple" (descontinuada)`,
      modulo: 'recetas',
      tipo: 'solicitud',
      usuario_solicitante_nombre: empleado.nombre,
      requiere_aprobacion: true,
      datos_adicionales: {
        accion: 'eliminar',
        datos_objeto: {
          id: 3,
          nombre: 'Brownie Simple',
          motivo: 'Receta descontinuada, ingredientes difíciles de conseguir'
        },
        action_type: 'delete_receta',
        solicitante_id: empleado.id,
        solicitante_nombre: empleado.nombre,
        timestamp: new Date().toISOString()
      }
    };

    const resultado = await apiService.makeRequest('/api/notifications/approval-request', {
      method: 'POST',
      body: JSON.stringify(solicitud)
    });

    console.log('✅ Solicitud enviada exitosamente:', resultado);
    console.log('📱 Los administradores deberían recibir una push notification');
    
  } catch (error) {
    console.error('❌ Error enviando solicitud:', error.message);
  }
}

async function enviarNotificacionUrgente(empleado) {
  try {
    console.log('\n🚨 === NOTIFICACIÓN URGENTE ===');
    
    const solicitud = {
      titulo: '🚨 URGENTE: Stock Crítico',
      mensaje: `${empleado.nombre} reporta: Stock crítico de "Harina" - Solo quedan 2kg`,
      modulo: 'inventario',
      tipo: 'urgente',
      usuario_solicitante_nombre: empleado.nombre,
      requiere_aprobacion: false,
      datos_adicionales: {
        accion: 'alerta',
        datos_objeto: {
          ingrediente: 'Harina',
          stock_actual: 2,
          unidad: 'kg',
          stock_minimo: 10,
          prioridad: 'alta'
        },
        action_type: 'stock_alert',
        solicitante_id: empleado.id,
        solicitante_nombre: empleado.nombre,
        timestamp: new Date().toISOString()
      }
    };

    const resultado = await apiService.makeRequest('/api/notifications/approval-request', {
      method: 'POST',
      body: JSON.stringify(solicitud)
    });

    console.log('✅ Notificación urgente enviada:', resultado);
    console.log('📱 Los administradores deberían recibir una push notification INMEDIATA');
    
  } catch (error) {
    console.error('❌ Error enviando notificación urgente:', error.message);
  }
}

// === FUNCIÓN PRINCIPAL ===
async function ejecutarPrueba() {
  try {
    console.log('🚀 Iniciando prueba de solicitudes empleado → administrador...\n');
    
    // 1. Configurar empleado
    const config = await configurarEmpleado();
    if (!config.success) {
      console.log('❌ No se pudo configurar el empleado');
      return;
    }
    
    const empleado = config.empleado;
    console.log(`👤 Empleado activo: ${empleado.nombre} (${empleado.rol})\n`);
    
    // 2. Esperar un poco para asegurar que todo esté listo
    console.log('⏳ Preparando envío de solicitudes...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Enviar diferentes tipos de solicitudes
    await enviarSolicitudCrearIngrediente(empleado);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await enviarSolicitudEditarPostre(empleado);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await enviarSolicitudEliminarReceta(empleado);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await enviarNotificacionUrgente(empleado);
    
    console.log('\n🎉 === PRUEBA COMPLETADA ===');
    console.log('📱 Revisa los iPhones de los administradores');
    console.log('✅ Deberían haber recibido 4 notificaciones push');
    console.log('📋 Las solicitudes aparecerán en la pantalla de Notificaciones');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
ejecutarPrueba(); 