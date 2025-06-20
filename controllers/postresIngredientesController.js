// Controlador de postres-ingredientes 
const PostreIngrediente = require('../models/postreIngrediente');
const PushNotificationService = require('../services/pushNotificationService');

exports.getAll = async (req, res) => {
    try {
        const items = await PostreIngrediente.getAllPostresIngredientes();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await PostreIngrediente.getPostreIngredienteById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Relación no encontrada' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getByPostre = async (req, res) => {
    try {
        const recetas = await PostreIngrediente.getRecetasByPostre(req.params.idPostre);
        res.json(recetas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { idPostre, idIngrediente, Cantidad } = req.body;
        console.log('Datos recibidos para crear receta:', { idPostre, idIngrediente, Cantidad });
        
        const nuevoRegistro = await PostreIngrediente.createPostreIngrediente(idPostre, idIngrediente, Cantidad);
        console.log('Resultado de createPostreIngrediente:', nuevoRegistro);
        
        // Obtener el registro completo con los nombres
        const registroCompleto = await PostreIngrediente.getPostreIngredienteById(nuevoRegistro.idPostreIngrediente);
        console.log('Registro completo:', registroCompleto);
        
        // Enviar notificación push a administradores (solo si hay usuario autenticado)
        if (req.user) {
            try {
                const userName = req.user.nombre || 'Usuario';
                await PushNotificationService.notifyRecetaCreated({
                    id: nuevoRegistro.idPostreIngrediente,
                    postre_nombre: registroCompleto?.postre_nombre || 'Postre'
                }, userName);
            } catch (notificationError) {
                console.error('Error enviando notificación:', notificationError);
                // No fallar la operación por error de notificación
            }
        }
        
        res.status(201).json(registroCompleto || nuevoRegistro);
    } catch (err) {
        console.error('Error en create receta:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { idPostre, idIngrediente, Cantidad } = req.body;
        
        // Verificar si el registro existe antes de actualizar
        const registroExistente = await PostreIngrediente.getPostreIngredienteById(req.params.id);
        if (!registroExistente) {
            return res.status(404).json({ error: 'Relación no encontrada' });
        }
        
        let rowsAffected = 0;
        
        // Permitir actualizar solo la cantidad si solo se envía ese campo
        if (Cantidad !== undefined && idPostre === undefined && idIngrediente === undefined) {
            rowsAffected = await PostreIngrediente.updateCantidad(req.params.id, Cantidad);
        } else {
            // Si se envían los tres campos, actualizar todo
            rowsAffected = await PostreIngrediente.updatePostreIngrediente(req.params.id, idPostre, idIngrediente, Cantidad);
        }
        
        if (rowsAffected === 0) {
            return res.status(404).json({ error: 'No se pudo actualizar la relación' });
        }
        
        // Enviar notificación push a administradores (solo si hay usuario autenticado)
        if (req.user) {
            try {
                const userName = req.user.nombre || 'Usuario';
                await PushNotificationService.notifyRecetaUpdated({
                    id: req.params.id,
                    postre_nombre: registroExistente.postre_nombre || 'Postre'
                }, userName);
            } catch (notificationError) {
                console.error('Error enviando notificación:', notificationError);
                // No fallar la operación por error de notificación
            }
        }
        
        res.json({ message: 'Relación actualizada', rowsAffected });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        console.log(`Intentando eliminar relación con ID: ${id} (tipo: ${typeof id})`);
        
        // Validar que el ID es un número válido
        if (isNaN(id) || id <= 0) {
            console.log(`ID inválido: ${req.params.id}`);
            return res.status(400).json({ error: 'ID inválido' });
        }
        
        // Verificar si el registro existe antes de eliminarlo
        const registroExistente = await PostreIngrediente.getPostreIngredienteById(id);
        if (!registroExistente) {
            console.log(`Registro con ID ${id} no encontrado`);
            return res.status(404).json({ error: 'Relación no encontrada' });
        }
        
        console.log(`Registro encontrado:`, registroExistente);
        
        // Eliminar el registro
        const rowsAffected = await PostreIngrediente.deletePostreIngrediente(id);
        console.log(`Operación DELETE completada. Filas afectadas: ${rowsAffected}`);
        
        if (rowsAffected === 0) {
            console.log(`No se eliminaron filas para ID ${id}`);
            return res.status(404).json({ error: 'No se pudo eliminar la relación - registro no encontrado' });
        }
        
        console.log(`Registro con ID ${id} eliminado exitosamente`);
        
        // Enviar notificación push a administradores (solo si hay usuario autenticado)
        if (req.user) {
            try {
                const userName = req.user.nombre || 'Usuario';
                await PushNotificationService.notifyRecetaDeleted({
                    postre_nombre: registroExistente.postre_nombre || 'Postre'
                }, userName);
            } catch (notificationError) {
                console.error('Error enviando notificación:', notificationError);
                // No fallar la operación por error de notificación
            }
        }
        
        res.json({ 
            message: 'Relación eliminada exitosamente', 
            id: id, 
            rowsAffected: rowsAffected 
        });
        
    } catch (err) {
        console.error('Error al eliminar relación:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor al eliminar la relación',
            details: err.message 
        });
    }
}; 