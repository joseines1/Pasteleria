const db = require('./db');

async function getAllPostres() {
    const result = await db.execute('SELECT * FROM postres');
    return result.rows;
}

async function getPostreById(id) {
    // Convertir a número si es BigInt
    const numericId = typeof id === 'bigint' ? Number(id) : id;
    const result = await db.execute('SELECT * FROM postres WHERE idPostre = ?', [numericId]);
    return result.rows[0];
}

async function createPostre(nombrePostre) {
    const result = await db.execute('INSERT INTO postres (nombrePostre) VALUES (?)', [nombrePostre]);
    // Convertir BigInt a número regular para evitar errores de tipo
    const id = Number(result.lastInsertRowid);
    return { idPostre: id, nombrePostre };
}

async function updatePostre(id, nombrePostre) {
    const result = await db.execute('UPDATE postres SET nombrePostre = ? WHERE idPostre = ?', [nombrePostre, id]);
    return result.rowsAffected || result.changes || 0;
}

async function deletePostre(id) {
    console.log(`Ejecutando DELETE para postre ID: ${id}`);
    try {
        // Convertir a número si es BigInt
        const numericId = typeof id === 'bigint' ? Number(id) : id;
        const result = await db.execute('DELETE FROM postres WHERE idPostre = ?', [numericId]);
        console.log(`Resultado completo de DELETE postre:`, JSON.stringify(result, null, 2));
        
        // En Turso/libSQL, el número de filas afectadas está en rowsAffected
        const rowsAffected = result.rowsAffected || result.changes || 0;
        console.log(`Filas afectadas: ${rowsAffected}`);
        
        return rowsAffected;
    } catch (error) {
        console.error('Error en deletePostre:', error);
        throw error;
    }
}

module.exports = {
    getAllPostres,
    getPostreById,
    createPostre,
    updatePostre,
    deletePostre
}; 