const PushNotificationService = require('../services/pushNotificationService');
const Usuario = require('../models/usuario');

// Enviar notificación de prueba
exports.sendTestNotification = async (req, res) => {
    try {
        const { title, body, module } = req.body;
        
        const testTitle = title || '🧪 Notificación de Prueba';
        const testBody = body || 'Esta es una notificación de prueba enviada desde la API';
        const testModule = module || 'test';
        
        const userName = req.user?.nombre || 'Sistema';
        
        await PushNotificationService.sendCustomNotification(
            testTitle,
            testBody,
            testModule,
            {
                sentBy: userName,
                timestamp: new Date().toISOString(),
                type: 'test'
            }
        );
        
        res.json({
            message: 'Notificación de prueba enviada',
            details: {
                title: testTitle,
                body: testBody,
                module: testModule,
                sentBy: userName
            }
        });
        
    } catch (error) {
        console.error('Error enviando notificación de prueba:', error);
        res.status(500).json({ error: 'Error enviando notificación' });
    }
};

// Enviar notificación personalizada
exports.sendCustomNotification = async (req, res) => {
    try {
        const { title, body, module, data } = req.body;
        
        if (!title || !body) {
            return res.status(400).json({ error: 'Título y mensaje son requeridos' });
        }
        
        const userName = req.user?.nombre || 'Administrador';
        
        await PushNotificationService.sendCustomNotification(
            title,
            body,
            module || 'custom',
            {
                ...data,
                sentBy: userName,
                timestamp: new Date().toISOString(),
                type: 'custom'
            }
        );
        
        res.json({
            message: 'Notificación personalizada enviada',
            details: {
                title,
                body,
                module: module || 'custom',
                sentBy: userName
            }
        });
        
    } catch (error) {
        console.error('Error enviando notificación personalizada:', error);
        res.status(500).json({ error: 'Error enviando notificación' });
    }
};

// Verificar push tokens registrados
exports.checkPushTokens = async (req, res) => {
    try {
        // Obtener todos los usuarios (administradores y empleados)
        const userTokens = await Usuario.getAdminPushTokens();
        const allUsers = await Usuario.getAllUsuarios();
        const eligibleUsers = allUsers.filter(user => user.rol === 'administrador' || user.rol === 'empleado');
        
        res.json({
            totalEligibleUsers: eligibleUsers.length,
            usersWithTokens: userTokens.length,
            usersWithoutTokens: eligibleUsers.length - userTokens.length,
            breakdown: {
                admins: allUsers.filter(u => u.rol === 'administrador').length,
                employees: allUsers.filter(u => u.rol === 'empleado').length
            },
            tokens: userTokens.map(token => ({
                token: token.substring(0, 20) + '...',
                isValid: token.startsWith('ExponentPushToken')
            })),
            message: userTokens.length === 0 
                ? 'No hay usuarios con push tokens registrados' 
                : `${userTokens.length} usuarios tienen tokens registrados`
        });
        
    } catch (error) {
        console.error('Error verificando push tokens:', error);
        res.status(500).json({ error: 'Error verificando tokens' });
    }
};

// Obtener estadísticas de notificaciones (placeholder)
exports.getNotificationStats = async (req, res) => {
    try {
        // Aquí podrías agregar lógica para obtener estadísticas de la base de datos
        const stats = {
            totalSent: 0,
            adminsWithTokens: 0,
            lastNotification: null,
            availableModules: ['ingredientes', 'postres', 'recetas', 'test', 'custom']
        };
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
}; 