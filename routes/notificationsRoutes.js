const express = require('express');
const router = express.Router();
const NotificationsController = require('../controllers/notificationsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ===== RUTAS PARA OBTENER NOTIFICACIONES =====

// GET /api/notifications - Obtener mis notificaciones
router.get('/', NotificationsController.getMyNotifications);

// GET /api/notifications/stats - Obtener estadísticas de notificaciones
router.get('/stats', NotificationsController.getStats);

// GET /api/notifications/pending - Obtener solicitudes pendientes (solo admins)
router.get('/pending', requireAdmin, NotificationsController.getPendingApprovals);

// ===== RUTAS PARA MANEJAR NOTIFICACIONES =====

// PUT /api/notifications/:id/read - Marcar como leída
router.put('/:id/read', NotificationsController.markAsRead);

// PUT /api/notifications/:id/approve - Aprobar/Rechazar solicitud (solo admins)
router.put('/:id/approve', requireAdmin, NotificationsController.handleApproval);

// DELETE /api/notifications/:id - Eliminar notificación
router.delete('/:id', NotificationsController.deleteNotification);

// ===== RUTAS PARA CREAR NOTIFICACIONES =====

// POST /api/notifications/custom - Crear solicitud personalizada
router.post('/custom', NotificationsController.createCustomRequest);

// ===== RUTAS ADMINISTRATIVAS =====

// DELETE /api/notifications/expired/clean - Limpiar notificaciones expiradas (solo admins)
router.delete('/expired/clean', requireAdmin, NotificationsController.cleanExpired);

module.exports = router; 