const express = require('express');
const router = express.Router();
const ingredientesController = require('../controllers/ingredientesController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.get('/', ingredientesController.getAll);
router.get('/:id', ingredientesController.getById);

// Rutas protegidas (requieren autenticación para enviar notificaciones)
router.post('/', authenticateToken, ingredientesController.create);
router.put('/:id', authenticateToken, ingredientesController.update);
router.delete('/:id', authenticateToken, ingredientesController.delete);

// Rutas de solicitudes (para empleados)
router.post('/:id/request-delete', authenticateToken, ingredientesController.requestDelete);
router.post('/:id/request-update', authenticateToken, ingredientesController.requestUpdate);
router.post('/custom-request', authenticateToken, ingredientesController.createCustomRequest);

module.exports = router; 