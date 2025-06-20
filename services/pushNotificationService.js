const { Expo } = require('expo-server-sdk');
const Usuario = require('../models/usuario');

// Crear una instancia de Expo SDK
const expo = new Expo();

class PushNotificationService {
    
    static async sendToAdmins(title, body, data = {}) {
        try {
            // Obtener tokens de push SOLO de administradores
            const adminUsers = await Usuario.getAdministradoresConTokens();
            const userTokens = adminUsers.map(admin => admin.pushToken);
            
            if (userTokens.length === 0) {
                console.log('⚠️  No hay ADMINISTRADORES con tokens de push registrados');
                console.log('💡 Los administradores deben iniciar sesión en la app móvil para generar tokens');
                return { sent: 0, errors: 1, message: 'No hay administradores con tokens registrados' };
            }

            // Validar tokens
            const validTokens = userTokens.filter(token => Expo.isExpoPushToken(token));
            
            if (validTokens.length === 0) {
                console.log('⚠️  No hay tokens de push válidos para administradores');
                console.log('💡 Los administradores necesitan regenerar sus tokens de notificación');
                return { sent: 0, errors: userTokens.length, message: 'No hay tokens de administradores válidos' };
            }

            // Crear los mensajes de notificación
            const messages = validTokens.map(token => ({
                to: token,
                sound: 'default',
                title: title,
                body: body,
                data: {
                    ...data,
                    timestamp: new Date().toISOString()
                },
                priority: 'high',
                channelId: 'pasteleria-staff'
            }));

            // Enviar las notificaciones en chunks
            const chunks = expo.chunkPushNotifications(messages);
            const tickets = [];
            let successCount = 0;
            let errorCount = 0;

            for (let chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                    
                    // Contar éxitos y errores
                    ticketChunk.forEach(ticket => {
                        if (ticket.status === 'ok') {
                            successCount++;
                        } else {
                            errorCount++;
                            console.log(`❌ Error en notificación: ${ticket.message}`);
                            
                            // Si el token no está registrado, sugerir regeneración
                            if (ticket.message && ticket.message.includes('not a registered push notification recipient')) {
                                console.log('💡 Sugerencia: El usuario debe cerrar sesión y volver a iniciar sesión para regenerar el token');
                            }
                        }
                    });
                    
                } catch (error) {
                    console.error('❌ Error enviando chunk de notificaciones:', error);
                    errorCount += chunk.length;
                }
            }

            // Logging mejorado
            if (successCount > 0) {
                console.log(`✅ Notificaciones enviadas exitosamente: ${successCount}`);
                console.log(`📧 Título: ${title}`);
                console.log(`📝 Mensaje: ${body}`);
            }
            
            if (errorCount > 0) {
                console.log(`⚠️  Notificaciones con errores: ${errorCount}`);
            }

            return {
                sent: successCount,
                errors: errorCount,
                totalTokens: validTokens.length,
                tickets: tickets
            };

        } catch (error) {
            console.error('❌ Error enviando push notifications:', error);
            return { sent: 0, errors: 1, message: error.message };
        }
    }

    // Método para verificar y limpiar tokens inválidos
    static async cleanInvalidTokens() {
        try {
            console.log('🧹 Limpiando tokens inválidos...');
            
            const userTokens = await Usuario.getAdminPushTokens();
            const invalidTokens = userTokens.filter(token => !Expo.isExpoPushToken(token));
            
            if (invalidTokens.length > 0) {
                console.log(`🗑️  Encontrados ${invalidTokens.length} tokens inválidos`);
                // Aquí podrías implementar lógica para limpiar tokens inválidos de la BD
            } else {
                console.log('✅ Todos los tokens son válidos');
            }
            
            return { cleaned: invalidTokens.length };
        } catch (error) {
            console.error('❌ Error limpiando tokens:', error);
            return { cleaned: 0, error: error.message };
        }
    }

    // Notificaciones específicas por módulo
    static async notifyIngredienteCreated(ingrediente, userName) {
        const title = '📦 Nuevo Ingrediente Registrado';
        const body = `${userName} agregó: ${ingrediente.nombre}`;
        const data = { 
            module: 'ingredientes', 
            action: 'create', 
            itemId: ingrediente.id,
            itemName: ingrediente.nombre
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyIngredienteUpdated(ingrediente, userName) {
        const title = '📦 Ingrediente Actualizado';
        const body = `${userName} actualizó: ${ingrediente.nombre}`;
        const data = { 
            module: 'ingredientes', 
            action: 'update', 
            itemId: ingrediente.id,
            itemName: ingrediente.nombre
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyIngredienteDeleted(ingredienteName, userName) {
        const title = '📦 Ingrediente Eliminado';
        const body = `${userName} eliminó: ${ingredienteName}`;
        const data = { 
            module: 'ingredientes', 
            action: 'delete', 
            itemName: ingredienteName
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyPostreCreated(postre, userName) {
        const title = '🍰 Nuevo Postre Registrado';
        const body = `${userName} agregó: ${postre.nombre}`;
        const data = { 
            module: 'postres', 
            action: 'create', 
            itemId: postre.id,
            itemName: postre.nombre
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyPostreUpdated(postre, userName) {
        const title = '🍰 Postre Actualizado';
        const body = `${userName} actualizó: ${postre.nombre}`;
        const data = { 
            module: 'postres', 
            action: 'update', 
            itemId: postre.id,
            itemName: postre.nombre
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyPostreDeleted(postreName, userName) {
        const title = '🍰 Postre Eliminado';
        const body = `${userName} eliminó: ${postreName}`;
        const data = { 
            module: 'postres', 
            action: 'delete', 
            itemName: postreName
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyRecetaCreated(receta, userName) {
        const title = '🔗 Nueva Receta Creada';
        const body = `${userName} creó una receta para: ${receta.postre_nombre}`;
        const data = { 
            module: 'recetas', 
            action: 'create', 
            itemId: receta.id,
            itemName: receta.postre_nombre
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyRecetaUpdated(receta, userName) {
        const title = '🔗 Receta Actualizada';
        const body = `${userName} actualizó la receta de: ${receta.postre_nombre}`;
        const data = { 
            module: 'recetas', 
            action: 'update', 
            itemId: receta.id,
            itemName: receta.postre_nombre
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    static async notifyRecetaDeleted(recetaInfo, userName) {
        const title = '🔗 Receta Eliminada';
        const body = `${userName} eliminó la receta de: ${recetaInfo.postre_nombre}`;
        const data = { 
            module: 'recetas', 
            action: 'delete', 
            itemName: recetaInfo.postre_nombre
        };
        
        return await this.sendToAdmins(title, body, data);
    }

    // Notificación personalizada
    static async sendCustomNotification(title, body, module, data = {}) {
        const customData = { 
            module: module, 
            action: 'custom',
            ...data
        };
        
        return await this.sendToAdmins(title, body, customData);
    }
}

module.exports = PushNotificationService; 