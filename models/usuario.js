const db = require('./db');
const bcrypt = require('bcryptjs');

async function getAllUsuarios() {
    const result = await db.execute('SELECT id, nombre, email, rol, push_token FROM usuarios');
    return result.rows;
}

async function getUsuarioById(id) {
    const result = await db.execute('SELECT id, nombre, email, rol, push_token FROM usuarios WHERE id = ?', [id]);
    return result.rows[0];
}

async function getUsuarioByEmail(email) {
    const result = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    return result.rows[0];
}

async function createUsuario(nombre, email, password, rol = 'empleado') {
    // Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const result = await db.execute(
        'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', 
        [nombre, email, hashedPassword, rol]
    );
    return result.lastInsertRowid;
}

async function updateUsuario(id, nombre, email, rol) {
    const result = await db.execute('UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?', [nombre, email, rol, id]);
    return result.rowsAffected || result.changes || 0;
}

async function updatePassword(id, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const result = await db.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, id]);
    return result.rowsAffected || result.changes || 0;
}

async function deleteUsuario(id) {
    console.log(`Ejecutando DELETE para usuario ID: ${id}`);
    try {
        const result = await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
        console.log(`Resultado completo de DELETE usuario:`, JSON.stringify(result, null, 2));
        
        // En Turso/libSQL, el número de filas afectadas está en rowsAffected
        const rowsAffected = result.rowsAffected || result.changes || 0;
        console.log(`Filas afectadas: ${rowsAffected}`);
        
        return rowsAffected;
    } catch (error) {
        console.error('Error en deleteUsuario:', error);
        throw error;
    }
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

async function updatePushToken(userId, pushToken) {
    const result = await db.execute('UPDATE usuarios SET push_token = ? WHERE id = ?', [pushToken, userId]);
    return result.rowsAffected || result.changes || 0;
}

async function getAdminPushTokens() {
    const result = await db.execute('SELECT push_token FROM usuarios WHERE (rol = ? OR rol = ?) AND push_token IS NOT NULL', ['administrador', 'empleado']);
    return result.rows.map(row => row.push_token).filter(token => token);
}

// Nueva función para obtener administradores con tokens push
async function getAdministradoresConTokens() {
    const result = await db.execute('SELECT id, nombre, email, rol, push_token as pushToken FROM usuarios WHERE rol = ? AND push_token IS NOT NULL', ['administrador']);
    return result.rows;
}

module.exports = {
    getAllUsuarios,
    getUsuarioById,
    getUsuarioByEmail,
    createUsuario,
    updateUsuario,
    updatePassword,
    deleteUsuario,
    validatePassword,
    updatePushToken,
    getAdminPushTokens,
    getAdministradoresConTokens
}; 