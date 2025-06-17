// Controlador de postres 
const Postre = require('../models/postre');
const PostreIngrediente = require('../models/postreIngrediente');
const PushNotificationService = require('../services/pushNotificationService');

exports.getAll = async (req, res) => {
    try {
        const postres = await Postre.getAllPostres();
        res.json(postres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const postre = await Postre.getPostreById(req.params.id);
        if (!postre) return res.status(404).json({ error: 'Postre no encontrado' });
        res.json(postre);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombrePostre } = req.body;
        console.log('Datos recibidos para crear postre:', { nombrePostre });
        
        const nuevoPostre = await Postre.createPostre(nombrePostre);
        console.log('Resultado de createPostre:', nuevoPostre);
        
        // Enviar notificación push a administradores
        try {
            const userName = req.user?.nombre || 'Usuario';
            await PushNotificationService.notifyPostreCreated({
                id: nuevoPostre.id,
                nombre: nombrePostre
            }, userName);
        } catch (notificationError) {
            console.error('Error enviando notificación:', notificationError);
            // No fallar la operación por error de notificación
        }
        
        res.status(201).json(nuevoPostre);
    } catch (err) {
        console.error('Error en create postre:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { nombrePostre } = req.body;
        
        // Verificar si el postre existe antes de actualizar
        const postreExistente = await Postre.getPostreById(req.params.id);
        if (!postreExistente) {
            return res.status(404).json({ error: 'Postre no encontrado' });
        }
        
        const rowsAffected = await Postre.updatePostre(req.params.id, nombrePostre);
        
        if (rowsAffected === 0) {
            return res.status(404).json({ error: 'No se pudo actualizar el postre' });
        }
        
        // Enviar notificación push a administradores
        try {
            const userName = req.user?.nombre || 'Usuario';
            await PushNotificationService.notifyPostreUpdated({
                id: req.params.id,
                nombre: nombrePostre
            }, userName);
        } catch (notificationError) {
            console.error('Error enviando notificación:', notificationError);
            // No fallar la operación por error de notificación
        }
        
        res.json({ message: 'Postre actualizado', rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        console.log(`Intentando eliminar postre con ID: ${id} (tipo: ${typeof id})`);
        
        // Validar que el ID es un número válido
        if (isNaN(id) || id <= 0) {
            console.log(`ID inválido: ${req.params.id}`);
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        // Verificar si el postre existe antes de eliminarlo
        const postreExistente = await Postre.getPostreById(id);
        if (!postreExistente) {
            console.log(`Postre con ID ${id} no encontrado`);
            return res.status(404).json({ error: 'Postre no encontrado' });
        }
        
        console.log(`Postre encontrado:`, postreExistente);
        
        // PASO 1: Eliminar todas las relaciones postre-ingrediente que usan este postre
        console.log(`Eliminando relaciones postre-ingrediente para postre ID: ${id}`);
        const relacionesEliminadas = await PostreIngrediente.deleteByPostreId(id);
        console.log(`Relaciones eliminadas: ${relacionesEliminadas}`);
        
        // PASO 2: Eliminar el postre
        const rowsAffected = await Postre.deletePostre(id);
        console.log(`Operación DELETE completada. Filas afectadas: ${rowsAffected}`);
        
        if (rowsAffected === 0) {
            console.log(`No se eliminaron filas para ID ${id}`);
            return res.status(404).json({ error: 'No se pudo eliminar el postre - registro no encontrado' });
        }
        
        console.log(`Postre con ID ${id} eliminado exitosamente`);
        
        // Enviar notificación push a administradores
        try {
            const userName = req.user?.nombre || 'Usuario';
            await PushNotificationService.notifyPostreDeleted(
                postreExistente.nombre,
                userName
            );
        } catch (notificationError) {
            console.error('Error enviando notificación:', notificationError);
            // No fallar la operación por error de notificación
        }
        
        res.json({ 
            message: 'Postre eliminado exitosamente', 
            id: id, 
            rowsAffected: rowsAffected,
            relacionesEliminadas: relacionesEliminadas
        });
        
    } catch (err) {
        console.error('Error al eliminar postre:', err);
        
        // Manejar específicamente errores de constraint
        if (err.message && err.message.includes('FOREIGN KEY constraint')) {
            res.status(409).json({ 
                error: 'No se puede eliminar el postre porque está siendo usado en recetas',
                details: 'Elimine primero las relaciones postre-ingrediente que usan este postre',
                suggestion: 'Use la opción de eliminación en cascada o elimine manualmente las dependencias'
            });
        } else {
            res.status(500).json({ 
                error: 'Error interno del servidor al eliminar el postre',
                details: err.message 
            });
        }
    }
}; 