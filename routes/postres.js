const express = require('express');
const router = express.Router();
const postresController = require('../controllers/postresController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.get('/', postresController.getAll);
router.get('/:id', postresController.getById);

// Rutas protegidas (requieren autenticación para enviar notificaciones)
router.post('/', authenticateToken, postresController.create);
router.put('/:id', authenticateToken, postresController.update);
router.delete('/:id', authenticateToken, postresController.delete);

module.exports = router; 