const Notification = require('../models/notification');
const PushNotificationService = require('../services/pushNotificationService');

class NotificationsController {

    // Obtener notificaciones del usuario actual
    static async getMyNotifications(req, res) {
        try {
            const user = req.user;
            
            // Obtener notificaciones específicas para el usuario y las de su tipo
            const userNotifications = await Notification.getForUser(user.id);
            const typeNotifications = await Notification.getForUserType(user.rol, user.id);
            
            // Combinar y eliminar duplicados
            const allNotifications = [...userNotifications, ...typeNotifications]
                .reduce((acc, current) => {
                    const existing = acc.find(item => item.id === current.id);
                    if (!existing) {
                        acc.push(current);
                    }
                    return acc;
                }, [])
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            res.json({
                success: true,
                notifications: allNotifications,
                total: allNotifications.length
            });

        } catch (error) {
            console.error('Error obteniendo notificaciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo notificaciones',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de notificaciones
    static async getStats(req, res) {
        try {
            const user = req.user;
            const stats = await Notification.getStats(user.id, user.rol);

            res.json({
                success: true,
                stats: stats,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    rol: user.rol
                }
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas',
                error: error.message
            });
        }
    }

    // Obtener solicitudes pendientes de aprobación (solo administradores)
    static async getPendingApprovals(req, res) {
        try {
            const user = req.user;

            if (user.rol !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo administradores pueden ver solicitudes pendientes'
                });
            }

            const pending = await Notification.getPendingApprovals();

            res.json({
                success: true,
                pending: pending,
                total: pending.length
            });

        } catch (error) {
            console.error('Error obteniendo solicitudes pendientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo solicitudes pendientes',
                error: error.message
            });
        }
    }

    // Marcar notificación como leída
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const result = await Notification.markAsRead(id, user.id);

            if (result === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Notificación no encontrada o no tienes permisos para marcarla'
                });
            }

            res.json({
                success: true,
                message: 'Notificación marcada como leída'
            });

        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            res.status(500).json({
                success: false,
                message: 'Error marcando notificación como leída',
                error: error.message
            });
        }
    }

    // Aprobar o rechazar solicitud (solo administradores)
    static async handleApproval(req, res) {
        try {
            const { id } = req.params;
            const { action, comment } = req.body; // action: 'aprobada' | 'rechazada'
            const user = req.user;

            if (user.rol !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo administradores pueden aprobar/rechazar solicitudes'
                });
            }

            if (!['aprobada', 'rechazada'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'Acción debe ser "aprobada" o "rechazada"'
                });
            }

            // Obtener la notificación antes de procesarla
            const notification = await Notification.getById(id);
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada'
                });
            }

            // Actualizar estado de aprobación
            const result = await Notification.updateApprovalStatus(
                id, 
                action, 
                user.id, 
                user.nombre, 
                comment
            );

            if (result === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Solicitud no encontrada o ya fue procesada'
                });
            }

            // Si se aprobó, ejecutar la acción correspondiente
            if (action === 'aprobada') {
                await this.executeApprovedAction(notification, user);
            }

            // Notificar al solicitante del resultado
            await this.notifyApprovalResult(notification, action, user.nombre, comment);

            res.json({
                success: true,
                message: `Solicitud ${action} exitosamente`,
                action: action,
                notification: {
                    id: notification.id,
                    titulo: notification.titulo,
                    modulo: notification.modulo,
                    accion: notification.accion
                }
            });

        } catch (error) {
            console.error('Error procesando aprobación:', error);
            res.status(500).json({
                success: false,
                message: 'Error procesando aprobación',
                error: error.message
            });
        }
    }

    // Eliminar notificación (solo si es destinatario específico)
    static async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const result = await Notification.delete(id, user.id);

            if (result === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Notificación no encontrada o no tienes permisos para eliminarla'
                });
            }

            res.json({
                success: true,
                message: 'Notificación eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando notificación:', error);
            res.status(500).json({
                success: false,
                message: 'Error eliminando notificación',
                error: error.message
            });
        }
    }

    // Crear solicitud personalizada
    static async createCustomRequest(req, res) {
        try {
            const { titulo, mensaje, modulo, datos_extra } = req.body;
            const user = req.user;

            if (!titulo || !mensaje || !modulo) {
                return res.status(400).json({
                    success: false,
                    message: 'Título, mensaje y módulo son requeridos'
                });
            }

            const notificationId = await Notification.createCustomModuleNotification(
                modulo,
                titulo,
                mensaje,
                user.id,
                user.nombre,
                datos_extra || {}
            );

            // Enviar push notification a administradores
            await PushNotificationService.sendToAdmins(
                `📋 Nueva Solicitud: ${titulo}`,
                `${user.nombre} envió una solicitud personalizada`,
                {
                    module: 'notifications',
                    action: 'custom_request',
                    notificationId: notificationId
                }
            );

            res.json({
                success: true,
                message: 'Solicitud personalizada creada exitosamente',
                notificationId: notificationId
            });

        } catch (error) {
            console.error('Error creando solicitud personalizada:', error);
            res.status(500).json({
                success: false,
                message: 'Error creando solicitud personalizada',
                error: error.message
            });
        }
    }

    // Limpiar notificaciones expiradas
    static async cleanExpired(req, res) {
        try {
            const user = req.user;

            if (user.rol !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo administradores pueden limpiar notificaciones expiradas'
                });
            }

            const cleaned = await Notification.cleanExpired();

            res.json({
                success: true,
                message: `${cleaned} notificaciones expiradas eliminadas`,
                cleaned: cleaned
            });

        } catch (error) {
            console.error('Error limpiando notificaciones expiradas:', error);
            res.status(500).json({
                success: false,
                message: 'Error limpiando notificaciones expiradas',
                error: error.message
            });
        }
    }

    // Método helper para ejecutar acciones aprobadas
    static async executeApprovedAction(notification, approver) {
        try {
            console.log(`🔄 Ejecutando acción aprobada: ${notification.accion} en ${notification.modulo}`);
            
            // Aquí integraremos con los controladores existentes
            const { modulo, accion, objeto_id, datos_adicionales } = notification;

            switch (modulo) {
                case 'ingredientes':
                    if (accion === 'solicitar_eliminar') {
                        // TODO: Integrar con ingredientesController.delete
                        console.log(`🗑️ Eliminando ingrediente ID: ${objeto_id}`);
                    } else if (accion === 'solicitar_actualizar') {
                        // TODO: Integrar con ingredientesController.update
                        console.log(`📝 Actualizando ingrediente ID: ${objeto_id}`);
                    }
                    break;

                case 'postres':
                    if (accion === 'solicitar_eliminar') {
                        // TODO: Integrar con postresController.delete
                        console.log(`🗑️ Eliminando postre ID: ${objeto_id}`);
                    } else if (accion === 'solicitar_actualizar') {
                        // TODO: Integrar con postresController.update
                        console.log(`📝 Actualizando postre ID: ${objeto_id}`);
                    }
                    break;

                default:
                    console.log(`ℹ️ Acción personalizada aprobada para módulo: ${modulo}`);
            }

        } catch (error) {
            console.error('Error ejecutando acción aprobada:', error);
            throw error;
        }
    }

    // Método helper para notificar resultado de aprobación
    static async notifyApprovalResult(notification, action, approverName, comment) {
        try {
            const isApproved = action === 'aprobada';
            const icon = isApproved ? '✅' : '❌';
            const status = isApproved ? 'aprobada' : 'rechazada';

            // Crear notificación para el solicitante
            await Notification.create({
                titulo: `${icon} Solicitud ${status}`,
                mensaje: `Tu solicitud "${notification.titulo}" ha sido ${status} por ${approverName}${comment ? `. Comentario: ${comment}` : '.'}`,
                tipo: isApproved ? 'aprobacion' : 'rechazo',
                usuario_destinatario_id: notification.usuario_solicitante_id,
                usuario_solicitante_id: 1, // Sistema
                usuario_solicitante_nombre: 'Sistema',
                modulo: notification.modulo,
                accion: `respuesta_${status}`,
                objeto_id: notification.objeto_id,
                objeto_nombre: notification.objeto_nombre,
                datos_adicionales: {
                    solicitud_original_id: notification.id,
                    aprobada_por: approverName,
                    comentario: comment
                }
            });

            // También enviar push notification si el usuario tiene token
            // TODO: Implementar envío de push notification específico

        } catch (error) {
            console.error('Error notificando resultado de aprobación:', error);
        }
    }
}

module.exports = NotificationsController; 