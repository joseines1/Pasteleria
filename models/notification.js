const db = require('./db');

class Notification {
    
    // Crear una nueva notificación
    static async create({
        titulo,
        mensaje,
        tipo = 'info', // 'info', 'solicitud', 'aprobacion', 'rechazo', 'alerta'
        usuario_destinatario_id = null, // null = para todos los del tipo
        tipo_usuario_destinatario = null, // 'administrador', 'empleado'
        usuario_solicitante_id,
        usuario_solicitante_nombre,
        modulo, // 'ingredientes', 'postres', 'recetas', 'usuarios', 'general'
        accion, // 'crear', 'actualizar', 'eliminar', 'solicitar_eliminar', etc.
        objeto_id = null,
        objeto_nombre = null,
        datos_adicionales = null,
        requiere_aprobacion = false,
        expires_at = null
    }) {
        try {
            const datosJson = datos_adicionales ? JSON.stringify(datos_adicionales) : null;
            
            const result = await db.execute(`
                INSERT INTO notifications (
                    titulo, mensaje, tipo, 
                    usuario_destinatario_id, tipo_usuario_destinatario,
                    usuario_solicitante_id, usuario_solicitante_nombre,
                    modulo, accion, objeto_id, objeto_nombre,
                    datos_adicionales, requiere_aprobacion, expires_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                titulo, mensaje, tipo,
                usuario_destinatario_id, tipo_usuario_destinatario,
                usuario_solicitante_id, usuario_solicitante_nombre,
                modulo, accion, objeto_id, objeto_nombre,
                datosJson, requiere_aprobacion, expires_at
            ]);

            return result.lastInsertRowid;
        } catch (error) {
            console.error('Error creando notificación:', error);
            throw error;
        }
    }

    // Obtener notificaciones para un usuario específico
    static async getForUser(userId) {
        try {
            const result = await db.execute(`
                SELECT * FROM notifications 
                WHERE usuario_destinatario_id = ? OR usuario_destinatario_id IS NULL
                ORDER BY created_at DESC
            `, [userId]);

            return result.rows.map(this.parseNotification);
        } catch (error) {
            console.error('Error obteniendo notificaciones para usuario:', error);
            throw error;
        }
    }

    // Obtener notificaciones para un tipo de usuario
    static async getForUserType(userType, userId = null) {
        try {
            let query = `
                SELECT * FROM notifications 
                WHERE (tipo_usuario_destinatario = ? OR tipo_usuario_destinatario IS NULL)
            `;
            let params = [userType];

            // Si se proporciona userId, excluir notificaciones específicas para otros usuarios
            if (userId) {
                query += ` AND (usuario_destinatario_id IS NULL OR usuario_destinatario_id = ?)`;
                params.push(userId);
            }

            query += ` ORDER BY created_at DESC`;

            const result = await db.execute(query, params);
            return result.rows.map(this.parseNotification);
        } catch (error) {
            console.error('Error obteniendo notificaciones para tipo de usuario:', error);
            throw error;
        }
    }

    // Obtener notificaciones pendientes de aprobación
    static async getPendingApprovals(userType = 'administrador') {
        try {
            const result = await db.execute(`
                SELECT * FROM notifications 
                WHERE requiere_aprobacion = TRUE 
                AND estado = 'no_leida'
                AND (tipo_usuario_destinatario = ? OR tipo_usuario_destinatario IS NULL)
                ORDER BY created_at ASC
            `, [userType]);

            return result.rows.map(this.parseNotification);
        } catch (error) {
            console.error('Error obteniendo solicitudes pendientes:', error);
            throw error;
        }
    }

    // Marcar como leída
    static async markAsRead(notificationId, userId = null) {
        try {
            let query, params;
            
            if (userId) {
                query = `
                    UPDATE notifications 
                    SET estado = 'leida', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? 
                    AND (usuario_destinatario_id = ? OR usuario_destinatario_id IS NULL)
                `;
                params = [notificationId, userId];
            } else {
                query = `
                    UPDATE notifications 
                    SET estado = 'leida', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;
                params = [notificationId];
            }

            const result = await db.execute(query, params);
            return result.rowsAffected || result.changes || 0;
        } catch (error) {
            console.error('Error marcando notificación como leída:', error);
            throw error;
        }
    }

    // Aprobar/Rechazar solicitud
    static async updateApprovalStatus(notificationId, status, approverId, approverName, comment = null) {
        try {
            const result = await db.execute(`
                UPDATE notifications 
                SET estado = ?, 
                    aprobada_por_id = ?, 
                    aprobada_por_nombre = ?,
                    fecha_aprobacion = CURRENT_TIMESTAMP,
                    comentario_aprobacion = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND requiere_aprobacion = TRUE
            `, [status, approverId, approverName, comment, notificationId]);

            return result.rowsAffected || result.changes || 0;
        } catch (error) {
            console.error('Error actualizando estado de aprobación:', error);
            throw error;
        }
    }

    // Eliminar notificación (solo si el usuario es destinatario específico)
    static async delete(notificationId, userId) {
        try {
            const result = await db.execute(`
                DELETE FROM notifications 
                WHERE id = ? 
                AND usuario_destinatario_id = ?
            `, [notificationId, userId]);

            return result.rowsAffected || result.changes || 0;
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            throw error;
        }
    }

    // Obtener estadísticas de notificaciones
    static async getStats(userId = null, userType = null) {
        try {
            let totalResult, unreadResult, pendingResult;

            if (userId && userType) {
                // Estadísticas para un usuario específico
                [totalResult, unreadResult, pendingResult] = await Promise.all([
                    // Total de notificaciones
                    db.execute(`
                        SELECT COUNT(*) as total FROM notifications 
                        WHERE (usuario_destinatario_id = ? OR tipo_usuario_destinatario = ?)
                    `, [userId, userType]),
                    
                    // No leídas
                    db.execute(`
                        SELECT COUNT(*) as unread FROM notifications 
                        WHERE estado = 'no_leida'
                        AND (usuario_destinatario_id = ? OR tipo_usuario_destinatario = ?)
                    `, [userId, userType]),
                    
                    // Pendientes de aprobación (solo para admins)
                    userType === 'administrador' ? db.execute(`
                        SELECT COUNT(*) as pending FROM notifications 
                        WHERE requiere_aprobacion = 1 AND estado = 'no_leida'
                    `) : Promise.resolve({ rows: [{ pending: 0 }] })
                ]);
            } else {
                // Estadísticas globales del sistema
                [totalResult, unreadResult, pendingResult] = await Promise.all([
                    db.execute(`SELECT COUNT(*) as total FROM notifications`),
                    db.execute(`SELECT COUNT(*) as unread FROM notifications WHERE estado = 'no_leida'`),
                    db.execute(`SELECT COUNT(*) as pending FROM notifications WHERE requiere_aprobacion = 1 AND estado = 'no_leida'`),
                    db.execute(`SELECT COUNT(*) as approved FROM notifications WHERE estado = 'aprobada'`),
                    db.execute(`SELECT COUNT(*) as rejected FROM notifications WHERE estado = 'rechazada'`)
                ]);

                return {
                    total: totalResult.rows[0].total,
                    unread: unreadResult.rows[0].unread,
                    pending: pendingResult.rows[0].pending,
                    approved: totalResult[3] ? totalResult[3].rows[0].approved : 0,
                    rejected: totalResult[4] ? totalResult[4].rows[0].rejected : 0
                };
            }

            return {
                total: totalResult.rows[0].total,
                unread: unreadResult.rows[0].unread,
                pending: pendingResult.rows[0].pending
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    // Limpiar notificaciones expiradas
    static async cleanExpired() {
        try {
            const result = await db.execute(`
                DELETE FROM notifications 
                WHERE expires_at IS NOT NULL 
                AND expires_at < CURRENT_TIMESTAMP
            `);

            return result.rowsAffected || result.changes || 0;
        } catch (error) {
            console.error('Error limpiando notificaciones expiradas:', error);
            throw error;
        }
    }

    // Obtener por ID
    static async getById(id) {
        try {
            const result = await db.execute(`
                SELECT * FROM notifications WHERE id = ?
            `, [id]);

            return result.rows.length > 0 ? this.parseNotification(result.rows[0]) : null;
        } catch (error) {
            console.error('Error obteniendo notificación por ID:', error);
            throw error;
        }
    }

    // Helper para parsear datos JSON
    static parseNotification(row) {
        return {
            ...row,
            datos_adicionales: row.datos_adicionales ? JSON.parse(row.datos_adicionales) : null,
            requiere_aprobacion: Boolean(row.requiere_aprobacion)
        };
    }

    // Métodos de utilidad para crear notificaciones específicas

    // Crear solicitud de eliminación
    static async createDeleteRequest(modulo, objeto_id, objeto_nombre, solicitante_id, solicitante_nombre, datos_extra = {}) {
        return await this.create({
            titulo: `🗑️ Solicitud de Eliminación - ${objeto_nombre}`,
            mensaje: `${solicitante_nombre} solicita eliminar ${objeto_nombre} del módulo de ${modulo}. ¿Aprobar eliminación?`,
            tipo: 'solicitud',
            tipo_usuario_destinatario: 'administrador',
            usuario_solicitante_id: solicitante_id,
            usuario_solicitante_nombre: solicitante_nombre,
            modulo: modulo,
            accion: 'solicitar_eliminar',
            objeto_id: objeto_id,
            objeto_nombre: objeto_nombre,
            datos_adicionales: datos_extra,
            requiere_aprobacion: true,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
        });
    }

    // Crear solicitud de modificación
    static async createUpdateRequest(modulo, objeto_id, objeto_nombre, solicitante_id, solicitante_nombre, cambios, datos_extra = {}) {
        return await this.create({
            titulo: `📝 Solicitud de Modificación - ${objeto_nombre}`,
            mensaje: `${solicitante_nombre} solicita modificar ${objeto_nombre} del módulo de ${modulo}. ¿Aprobar cambios?`,
            tipo: 'solicitud',
            tipo_usuario_destinatario: 'administrador',
            usuario_solicitante_id: solicitante_id,
            usuario_solicitante_nombre: solicitante_nombre,
            modulo: modulo,
            accion: 'solicitar_actualizar',
            objeto_id: objeto_id,
            objeto_nombre: objeto_nombre,
            datos_adicionales: { cambios, ...datos_extra },
            requiere_aprobacion: true,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    // Crear notificación personalizada por módulo
    static async createCustomModuleNotification(modulo, titulo, mensaje, solicitante_id, solicitante_nombre, datos_extra = {}) {
        return await this.create({
            titulo: titulo,
            mensaje: mensaje,
            tipo: 'solicitud',
            tipo_usuario_destinatario: 'administrador',
            usuario_solicitante_id: solicitante_id,
            usuario_solicitante_nombre: solicitante_nombre,
            modulo: modulo,
            accion: 'personalizada',
            datos_adicionales: datos_extra,
            requiere_aprobacion: true,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
    }
}

module.exports = Notification; 