const express = require('express');
const router = express.Router();
const { probarNotificacion } = require('../services/notificationService');
const { requireAuth } = require('../middleware/auth');

// Test de conexión básico
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    server: 'Mi Proyecto MVC'
  });
});

// Test de notificación push
router.post('/notificacion', requireAuth, async (req, res) => {
  try {
    console.log('🧪 Enviando notificación de prueba...');
    
    const resultado = await probarNotificacion();
    
    if (resultado.success) {
      res.json({
        success: true,
        message: 'Notificación de prueba enviada exitosamente',
        data: resultado.data,
        enviados: resultado.enviados || 0
      });
    } else {
      res.status(400).json({
        success: false,
        message: resultado.message || 'Error enviando notificación de prueba',
        error: resultado.error
      });
    }
  } catch (error) {
    console.error('❌ Error en test de notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Test de notificación personalizada (para desarrollo)
router.post('/notificacion-personalizada', requireAuth, async (req, res) => {
  try {
    const { titulo, mensaje, datos } = req.body;
    
    if (!titulo || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere título y mensaje'
      });
    }

    // Enviar notificación personalizada
    const resultado = await probarNotificacion(titulo, mensaje, datos);
    
    res.json({
      success: true,
      message: 'Notificación personalizada enviada',
      data: resultado.data,
      enviados: resultado.enviados || 0
    });
    
  } catch (error) {
    console.error('❌ Error enviando notificación personalizada:', error);
    res.status(500).json({
      success: false,
      message: 'Error enviando notificación personalizada',
      error: error.message
    });
  }
});

module.exports = router; 