const db = require('./db');

async function getAllIngredientes() {
    const result = await db.execute('SELECT * FROM ingredientes');
    return result.rows;
}

async function getIngredienteById(id) {
    // Convertir a número si es BigInt
    const numericId = typeof id === 'bigint' ? Number(id) : id;
    const result = await db.execute('SELECT * FROM ingredientes WHERE idIngrediente = ?', [numericId]);
    return result.rows[0];
}

async function createIngrediente(nombreIngrediente, existencias) {
    const result = await db.execute('INSERT INTO ingredientes (nombreIngrediente, existencias) VALUES (?, ?)', [nombreIngrediente, existencias]);
    // Convertir BigInt a número regular para evitar errores de tipo
    const id = Number(result.lastInsertRowid);
    return { idIngrediente: id, nombreIngrediente, existencias };
}

async function updateIngrediente(id, nombreIngrediente, existencias) {
    const result = await db.execute('UPDATE ingredientes SET nombreIngrediente = ?, existencias = ? WHERE idIngrediente = ?', [nombreIngrediente, existencias, id]);
    return result.rowsAffected || result.changes || 0;
}

async function deleteIngrediente(id) {
    console.log(`Ejecutando DELETE para ingrediente ID: ${id}`);
    try {
        // Convertir a número si es BigInt
        const numericId = typeof id === 'bigint' ? Number(id) : id;
        const result = await db.execute('DELETE FROM ingredientes WHERE idIngrediente = ?', [numericId]);
        console.log(`Resultado completo de DELETE ingrediente:`, JSON.stringify(result, null, 2));
        
        // En Turso/libSQL, el número de filas afectadas está en rowsAffected
        const rowsAffected = result.rowsAffected || result.changes || 0;
        console.log(`Filas afectadas: ${rowsAffected}`);
        
        return rowsAffected;
    } catch (error) {
        console.error('Error en deleteIngrediente:', error);
        throw error;
    }
}

module.exports = {
    getAllIngredientes,
    getIngredienteById,
    createIngrediente,
    updateIngrediente,
    deleteIngrediente
}; 