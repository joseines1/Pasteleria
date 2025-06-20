const express = require('express');
const router = express.Router();
const postresIngredientesController = require('../controllers/postresIngredientesController');
const { authenticateToken } = require('../middleware/auth');

// Rutas temporales sin autenticación para desarrollo/testing (DEBEN IR ANTES de las rutas con parámetros)
router.post('/test', postresIngredientesController.create);
router.put('/test/:id', postresIngredientesController.update);
router.delete('/test/:id', postresIngredientesController.delete);

// Rutas públicas (sin autenticación)
router.get('/', postresIngredientesController.getAll);
router.get('/postre/:idPostre', postresIngredientesController.getByPostre);
router.get('/:id', postresIngredientesController.getById);

// Rutas sin autenticación (temporalmente para desarrollo)
router.post('/', postresIngredientesController.create);
router.put('/:id', postresIngredientesController.update);
router.delete('/:id', postresIngredientesController.delete);

// Rutas protegidas (requieren autenticación para enviar notificaciones) - COMENTADAS TEMPORALMENTE
// router.post('/', authenticateToken, postresIngredientesController.create);
// router.put('/:id', authenticateToken, postresIngredientesController.update);
// router.delete('/:id', authenticateToken, postresIngredientesController.delete);

module.exports = router; 