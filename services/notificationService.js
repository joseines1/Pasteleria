const { sendPushNotification, isValidPushToken } = require('../config/firebase');
const Usuario = require('../models/usuario');

// Función para enviar notificación a administradores
async function enviarNotificacionAdministradores(titulo, mensaje, datos = {}) {
    try {
        console.log(`📢 Preparando notificación para administradores: ${titulo}`);
        
        // Obtener todos los administradores con tokens push
        const administradores = await Usuario.getAdministradoresConTokens();
        
        if (!administradores || administradores.length === 0) {
            console.log('⚠️ No hay administradores con tokens push registrados');
            return { success: false, message: 'No hay administradores con tokens' };
        }
        
        // Filtrar tokens válidos
        const tokensValidos = administradores
            .map(admin => admin.pushToken)
            .filter(token => isValidPushToken(token));
        
        if (tokensValidos.length === 0) {
            console.log('⚠️ No hay tokens push válidos');
            return { success: false, message: 'No hay tokens válidos' };
        }
        
        console.log(`📱 Enviando a ${tokensValidos.length} administradores`);
        
        // Enviar notificación usando Firebase/Expo
        const resultado = await sendPushNotification(
            tokensValidos,
            titulo,
            mensaje,
            {
                tipo: 'admin_notification',
                ...datos
            }
        );
        
        console.log('✅ Notificación enviada exitosamente');
        return { 
            success: true, 
            message: 'Notificación enviada', 
            tokensEnviados: tokensValidos.length,
            resultado 
        };
        
    } catch (error) {
        console.error('❌ Error enviando notificación a administradores:', error.message);
        return { success: false, message: error.message };
    }
}

// Función para enviar notificación a un usuario específico
async function enviarNotificacionUsuario(userId, titulo, mensaje, datos = {}) {
    try {
        const usuario = await Usuario.getUsuarioById(userId);
        
        if (!usuario || !usuario.pushToken) {
            console.log(`⚠️ Usuario ${userId} no tiene token push`);
            return { success: false, message: 'Usuario sin token push' };
        }
        
        if (!isValidPushToken(usuario.pushToken)) {
            console.log(`⚠️ Token inválido para usuario ${userId}`);
            return { success: false, message: 'Token inválido' };
        }
        
        const resultado = await sendPushNotification(
            [usuario.pushToken],
            titulo,
            mensaje,
            {
                tipo: 'user_notification',
                userId: userId,
                ...datos
            }
        );
        
        console.log(`✅ Notificación enviada a usuario ${usuario.nombre}`);
        return { success: true, message: 'Notificación enviada', resultado };
        
    } catch (error) {
        console.error(`❌ Error enviando notificación a usuario ${userId}:`, error.message);
        return { success: false, message: error.message };
    }
}

// Funciones específicas para operaciones CRUD
async function notificarIngresoIngrediente(nombreIngrediente, cantidad, unidad) {
    return await enviarNotificacionAdministradores(
        '🥄 Nuevo Ingrediente',
        `Se agregó: ${nombreIngrediente} (${cantidad} ${unidad})`,
        { 
            accion: 'crear_ingrediente', 
            ingrediente: nombreIngrediente,
            cantidad,
            unidad
        }
    );
}

async function notificarActualizacionIngrediente(nombreIngrediente, nuevaCantidad, unidad) {
    return await enviarNotificacionAdministradores(
        '📝 Ingrediente Actualizado',
        `${nombreIngrediente} actualizado a ${nuevaCantidad} ${unidad}`,
        { 
            accion: 'actualizar_ingrediente', 
            ingrediente: nombreIngrediente,
            cantidad: nuevaCantidad,
            unidad
        }
    );
}

async function notificarEliminacionIngrediente(nombreIngrediente) {
    return await enviarNotificacionAdministradores(
        '🗑️ Ingrediente Eliminado',
        `Se eliminó: ${nombreIngrediente}`,
        { 
            accion: 'eliminar_ingrediente', 
            ingrediente: nombreIngrediente 
        }
    );
}

async function notificarIngresoPostre(nombrePostre, precio) {
    return await enviarNotificacionAdministradores(
        '🧁 Nuevo Postre',
        `Se agregó: ${nombrePostre} - $${precio}`,
        { 
            accion: 'crear_postre', 
            postre: nombrePostre,
            precio
        }
    );
}

async function notificarActualizacionPostre(nombrePostre, nuevoPrecio) {
    return await enviarNotificacionAdministradores(
        '📝 Postre Actualizado',
        `${nombrePostre} actualizado - $${nuevoPrecio}`,
        { 
            accion: 'actualizar_postre', 
            postre: nombrePostre,
            precio: nuevoPrecio
        }
    );
}

async function notificarEliminacionPostre(nombrePostre) {
    return await enviarNotificacionAdministradores(
        '🗑️ Postre Eliminado',
        `Se eliminó: ${nombrePostre}`,
        { 
            accion: 'eliminar_postre', 
            postre: nombrePostre 
        }
    );
}

async function notificarRecetaCreada(nombrePostre, ingredientes) {
    return await enviarNotificacionAdministradores(
        '📋 Nueva Receta',
        `Receta creada para: ${nombrePostre}`,
        { 
            accion: 'crear_receta', 
            postre: nombrePostre,
            ingredientes: ingredientes.length
        }
    );
}

// Función para probar notificaciones
async function probarNotificacion() {
    console.log('🧪 Probando sistema de notificaciones...');
    
    const resultado = await enviarNotificacionAdministradores(
        '🧪 Prueba de Sistema',
        'Esta es una notificación de prueba del sistema de pastelería',
        { 
            tipo: 'test',
            timestamp: new Date().toISOString()
        }
    );
    
    return resultado;
}

module.exports = {
    enviarNotificacionAdministradores,
    enviarNotificacionUsuario,
    notificarIngresoIngrediente,
    notificarActualizacionIngrediente,
    notificarEliminacionIngrediente,
    notificarIngresoPostre,
    notificarActualizacionPostre,
    notificarEliminacionPostre,
    notificarRecetaCreada,
    probarNotificacion
}; 