// Modelo de postre-ingrediente 
const db = require('./db');

async function getAllPostresIngredientes() {
    const result = await db.execute(`
        SELECT 
            pi.idPostreIngrediente as id, 
            pi.idPostre, 
            pi.idIngrediente, 
            pi.Cantidad,
            p.nombrePostre as postre_nombre,
            i.nombreIngrediente as ingrediente_nombre
        FROM postresingredientes pi
        LEFT JOIN postres p ON pi.idPostre = p.idPostre
        LEFT JOIN ingredientes i ON pi.idIngrediente = i.idIngrediente
        ORDER BY p.nombrePostre, i.nombreIngrediente
    `);
    return result.rows;
}

async function getPostreIngredienteById(id) {
    const result = await db.execute(`
        SELECT 
            pi.idPostreIngrediente as id, 
            pi.idPostre, 
            pi.idIngrediente, 
            pi.Cantidad,
            p.nombrePostre as postre_nombre,
            i.nombreIngrediente as ingrediente_nombre
        FROM postresingredientes pi
        LEFT JOIN postres p ON pi.idPostre = p.idPostre
        LEFT JOIN ingredientes i ON pi.idIngrediente = i.idIngrediente
        WHERE pi.idPostreIngrediente = ?
    `, [id]);
    return result.rows[0];
}

async function getRecetasByPostre(idPostre) {
    const result = await db.execute(`
        SELECT 
            pi.idPostreIngrediente as id, 
            pi.idPostre, 
            pi.idIngrediente, 
            pi.Cantidad,
            p.nombrePostre as postre_nombre,
            i.nombreIngrediente as ingrediente_nombre
        FROM postresingredientes pi
        LEFT JOIN postres p ON pi.idPostre = p.idPostre
        LEFT JOIN ingredientes i ON pi.idIngrediente = i.idIngrediente
        WHERE pi.idPostre = ?
        ORDER BY i.nombreIngrediente
    `, [idPostre]);
    return result.rows;
}

async function createPostreIngrediente(idPostre, idIngrediente, Cantidad) {
    // Convertir a números si son BigInt
    const numericIdPostre = typeof idPostre === 'bigint' ? Number(idPostre) : idPostre;
    const numericIdIngrediente = typeof idIngrediente === 'bigint' ? Number(idIngrediente) : idIngrediente;
    
    const result = await db.execute('INSERT INTO postresingredientes (idPostre, idIngrediente, Cantidad) VALUES (?, ?, ?)', [numericIdPostre, numericIdIngrediente, Cantidad]);
    // Convertir BigInt a número regular
    const id = Number(result.lastInsertRowid);
    return { idPostreIngrediente: id, idPostre: numericIdPostre, idIngrediente: numericIdIngrediente, Cantidad };
}

async function updatePostreIngrediente(id, idPostre, idIngrediente, Cantidad) {
    const result = await db.execute('UPDATE postresingredientes SET idPostre = ?, idIngrediente = ?, Cantidad = ? WHERE idPostreIngrediente = ?', [idPostre, idIngrediente, Cantidad, id]);
    return result.rowsAffected || result.changes || 0;
}

async function updateCantidad(id, Cantidad) {
    const result = await db.execute('UPDATE postresingredientes SET Cantidad = ? WHERE idPostreIngrediente = ?', [Cantidad, id]);
    return result.rowsAffected || result.changes || 0;
}

async function deletePostreIngrediente(id) {
    console.log(`Ejecutando DELETE para ID: ${id}`);
    try {
        const result = await db.execute('DELETE FROM postresingredientes WHERE idPostreIngrediente = ?', [id]);
        console.log(`Resultado completo de DELETE:`, JSON.stringify(result, null, 2));
        
        // En Turso/libSQL, el número de filas afectadas está en rowsAffected
        const rowsAffected = result.rowsAffected || result.changes || 0;
        console.log(`Filas afectadas: ${rowsAffected}`);
        
        return rowsAffected;
    } catch (error) {
        console.error('Error en deletePostreIngrediente:', error);
        throw error;
    }
}

// Nueva función para eliminar por ingrediente ID (eliminación en cascada)
async function deleteByIngredienteId(idIngrediente) {
    console.log(`Ejecutando DELETE en cascada para ingrediente ID: ${idIngrediente}`);
    try {
        // Convertir a número si es BigInt
        const numericId = typeof idIngrediente === 'bigint' ? Number(idIngrediente) : idIngrediente;
        const result = await db.execute('DELETE FROM postresingredientes WHERE idIngrediente = ?', [numericId]);
        console.log(`Resultado completo de DELETE en cascada:`, JSON.stringify(result, null, 2));
        
        const rowsAffected = result.rowsAffected || result.changes || 0;
        console.log(`Relaciones eliminadas en cascada: ${rowsAffected}`);
        
        return rowsAffected;
    } catch (error) {
        console.error('Error en deleteByIngredienteId:', error);
        throw error;
    }
}

// Nueva función para eliminar por postre ID (eliminación en cascada)
async function deleteByPostreId(idPostre) {
    console.log(`Ejecutando DELETE en cascada para postre ID: ${idPostre}`);
    try {
        // Convertir a número si es BigInt
        const numericId = typeof idPostre === 'bigint' ? Number(idPostre) : idPostre;
        const result = await db.execute('DELETE FROM postresingredientes WHERE idPostre = ?', [numericId]);
        console.log(`Resultado completo de DELETE en cascada:`, JSON.stringify(result, null, 2));
        
        const rowsAffected = result.rowsAffected || result.changes || 0;
        console.log(`Relaciones eliminadas en cascada: ${rowsAffected}`);
        
        return rowsAffected;
    } catch (error) {
        console.error('Error en deleteByPostreId:', error);
        throw error;
    }
}

module.exports = {
    getAllPostresIngredientes,
    getPostreIngredienteById,
    getRecetasByPostre,
    createPostreIngrediente,
    updatePostreIngrediente,
    updateCantidad,
    deletePostreIngrediente,
    deleteByIngredienteId,
    deleteByPostreId
}; 