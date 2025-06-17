// Controlador de ingredientes 
const Ingrediente = require('../models/ingrediente');
const PostreIngrediente = require('../models/postreIngrediente');
const PushNotificationService = require('../services/pushNotificationService');

exports.getAll = async (req, res) => {
    try {
        const ingredientes = await Ingrediente.getAllIngredientes();
        res.json(ingredientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const ingrediente = await Ingrediente.getIngredienteById(req.params.id);
        if (!ingrediente) return res.status(404).json({ error: 'Ingrediente no encontrado' });
        res.json(ingrediente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombreIngrediente, existencias } = req.body;
        console.log('Datos recibidos para crear ingrediente:', { nombreIngrediente, existencias });
        
        const nuevoIngrediente = await Ingrediente.createIngrediente(nombreIngrediente, existencias);
        console.log('Resultado de createIngrediente:', nuevoIngrediente);
        
        // Enviar notificación push a administradores
        try {
            const userName = req.user?.nombre || 'Usuario';
            await PushNotificationService.notifyIngredienteCreated({
                id: nuevoIngrediente.id,
                nombre: nombreIngrediente
            }, userName);
        } catch (notificationError) {
            console.error('Error enviando notificación:', notificationError);
            // No fallar la operación por error de notificación
        }
        
        res.status(201).json(nuevoIngrediente);
    } catch (err) {
        console.error('Error en create ingrediente:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { nombreIngrediente, existencias } = req.body;
        
        // Verificar si el ingrediente existe antes de actualizar
        const ingredienteExistente = await Ingrediente.getIngredienteById(req.params.id);
        if (!ingredienteExistente) {
            return res.status(404).json({ error: 'Ingrediente no encontrado' });
        }
        
        const rowsAffected = await Ingrediente.updateIngrediente(req.params.id, nombreIngrediente, existencias);
        
        if (rowsAffected === 0) {
            return res.status(404).json({ error: 'No se pudo actualizar el ingrediente' });
        }
        
        // Enviar notificación push a administradores
        try {
            const userName = req.user?.nombre || 'Usuario';
            await PushNotificationService.notifyIngredienteUpdated({
                id: req.params.id,
                nombre: nombreIngrediente
            }, userName);
        } catch (notificationError) {
            console.error('Error enviando notificación:', notificationError);
            // No fallar la operación por error de notificación
        }
        
        res.json({ message: 'Ingrediente actualizado', rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        console.log(`Intentando eliminar ingrediente con ID: ${id} (tipo: ${typeof id})`);
        
        // Validar que el ID es un número válido
        if (isNaN(id) || id <= 0) {
            console.log(`ID inválido: ${req.params.id}`);
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        // Verificar si el ingrediente existe antes de eliminarlo
        const ingredienteExistente = await Ingrediente.getIngredienteById(id);
        if (!ingredienteExistente) {
            console.log(`Ingrediente con ID ${id} no encontrado`);
            return res.status(404).json({ error: 'Ingrediente no encontrado' });
        }
        
        console.log(`Ingrediente encontrado:`, ingredienteExistente);
        
        // PASO 1: Eliminar todas las relaciones postre-ingrediente que usan este ingrediente
        console.log(`Eliminando relaciones postre-ingrediente para ingrediente ID: ${id}`);
        const relacionesEliminadas = await PostreIngrediente.deleteByIngredienteId(id);
        console.log(`Relaciones eliminadas: ${relacionesEliminadas}`);
        
        // PASO 2: Eliminar el ingrediente
        const rowsAffected = await Ingrediente.deleteIngrediente(id);
        console.log(`Operación DELETE completada. Filas afectadas: ${rowsAffected}`);
        
        if (rowsAffected === 0) {
            console.log(`No se eliminaron filas para ID ${id}`);
            return res.status(404).json({ error: 'No se pudo eliminar el ingrediente - registro no encontrado' });
        }
        
        console.log(`Ingrediente con ID ${id} eliminado exitosamente`);
        
        // Enviar notificación push a administradores
        try {
            const userName = req.user?.nombre || 'Usuario';
            await PushNotificationService.notifyIngredienteDeleted(
                ingredienteExistente.nombre,
                userName
            );
        } catch (notificationError) {
            console.error('Error enviando notificación:', notificationError);
            // No fallar la operación por error de notificación
        }
        
        res.json({ 
            message: 'Ingrediente eliminado exitosamente', 
            id: id, 
            rowsAffected: rowsAffected,
            relacionesEliminadas: relacionesEliminadas
        });
        
    } catch (err) {
        console.error('Error al eliminar ingrediente:', err);
        
        // Manejar específicamente errores de constraint
        if (err.message && err.message.includes('FOREIGN KEY constraint')) {
            res.status(409).json({ 
                error: 'No se puede eliminar el ingrediente porque está siendo usado en recetas',
                details: 'Elimine primero las relaciones postre-ingrediente que usan este ingrediente',
                suggestion: 'Use la opción de eliminación en cascada o elimine manualmente las dependencias'
            });
        } else {
            res.status(500).json({ 
                error: 'Error interno del servidor al eliminar el ingrediente',
                details: err.message 
            });
        }
    }
}; 