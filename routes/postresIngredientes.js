const express = require('express');
const router = express.Router();
const postresIngredientesController = require('../controllers/postresIngredientesController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.get('/', postresIngredientesController.getAll);
router.get('/:id', postresIngredientesController.getById);

// Rutas protegidas (requieren autenticación para enviar notificaciones)
router.post('/', authenticateToken, postresIngredientesController.create);
router.put('/:id', authenticateToken, postresIngredientesController.update);
router.delete('/:id', authenticateToken, postresIngredientesController.delete);

module.exports = router; 