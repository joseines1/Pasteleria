const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const PushNotificationService = require('../services/pushNotificationService');

// Todas las rutas requieren autenticación de administrador

// Enviar notificación de prueba
router.post('/test', authenticateToken, requireAdmin, notificationController.sendTestNotification);

// Enviar notificación personalizada
router.post('/custom', authenticateToken, requireAdmin, notificationController.sendCustomNotification);

// Obtener estadísticas de notificaciones
router.get('/stats', authenticateToken, requireAdmin, notificationController.getNotificationStats);

// Nuevo endpoint para probar push tokens
router.get('/check-tokens', authenticateToken, requireAdmin, notificationController.checkPushTokens);

// Endpoint para enviar notificación de prueba
router.post('/send-test', authenticateToken, async (req, res) => {
    try {
        const { title, body, data } = req.body;
        const user = req.user;

        console.log(`🧪 Enviando notificación de prueba solicitada por: ${user.nombre}`);

        // Validar que el usuario sea admin o empleado
        if (user.rol !== 'administrador' && user.rol !== 'empleado') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para enviar notificaciones'
            });
        }

        // Enviar notificación solo a administradores
        const result = await PushNotificationService.sendToAdmins(
            title || '🧪 Notificación de Prueba',
            body || 'Esta es una notificación de prueba enviada desde la app',
            {
                module: 'test',
                sentBy: user.nombre,
                timestamp: new Date().toISOString(),
                ...data
            }
        );

        console.log(`✅ Notificación de prueba enviada a ${result.sent || 'administradores'}`);

        res.json({
            success: true,
            message: 'Notificación de prueba enviada exitosamente a ADMINISTRADORES',
            sent: result.sent || 'administradores',
            details: result
        });

    } catch (error) {
        console.error('❌ Error enviando notificación de prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando notificación de prueba',
            error: error.message
        });
    }
});

// Endpoint para obtener el estado de las notificaciones
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const user = req.user;

        // Solo admins y empleados pueden ver el estado
        if (user.rol !== 'administrador' && user.rol !== 'empleado') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver el estado de notificaciones'
            });
        }

        // Obtener información básica del estado
        const status = {
            server: 'running',
            timestamp: new Date().toISOString(),
            pushService: 'active'
        };

        res.json({
            success: true,
            status: status,
            user: {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol,
                push_token: user.push_token ? 'Configurado' : 'No configurado'
            }
        });

    } catch (error) {
        console.error('❌ Error obteniendo estado de notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estado de notificaciones',
            error: error.message
        });
    }
});

module.exports = router; 