const db = require('./db');
const crypto = require('crypto');

// Generar código de recuperación de 6 dígitos
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Crear código de recuperación
async function createResetCode(email) {
    try {
        // Limpiar códigos expirados del email
        await cleanExpiredCodes(email);
        
        const code = generateResetCode();
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Expira en 30 minutos
        
        const result = await db.execute(
            'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)',
            [email, code, expiresAt.toISOString()]
        );
        
        return {
            id: result.lastInsertRowid,
            code: code,
            expiresAt: expiresAt
        };
    } catch (error) {
        console.error('Error creando código de recuperación:', error);
        throw error;
    }
}

// Validar código de recuperación
async function validateResetCode(email, code) {
    try {
        const result = await db.execute(
            'SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = FALSE AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1',
            [email, code]
        );
        
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error validando código:', error);
        throw error;
    }
}

// Marcar código como usado
async function markCodeAsUsed(id) {
    try {
        const result = await db.execute(
            'UPDATE password_resets SET used = TRUE WHERE id = ?',
            [id]
        );
        
        return result.rowsAffected || result.changes || 0;
    } catch (error) {
        console.error('Error marcando código como usado:', error);
        throw error;
    }
}

// Limpiar códigos expirados
async function cleanExpiredCodes(email = null) {
    try {
        let query = 'DELETE FROM password_resets WHERE expires_at < datetime("now") OR used = TRUE';
        let params = [];
        
        if (email) {
            query += ' AND email = ?';
            params.push(email);
        }
        
        const result = await db.execute(query, params);
        return result.rowsAffected || result.changes || 0;
    } catch (error) {
        console.error('Error limpiando códigos expirados:', error);
        throw error;
    }
}

// Obtener estadísticas de códigos
async function getResetStats(email) {
    try {
        const result = await db.execute(
            'SELECT COUNT(*) as total, COUNT(CASE WHEN used = TRUE THEN 1 END) as used FROM password_resets WHERE email = ? AND created_at > datetime("now", "-24 hours")',
            [email]
        );
        
        return result.rows[0] || { total: 0, used: 0 };
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        throw error;
    }
}

module.exports = {
    generateResetCode,
    createResetCode,
    validateResetCode,
    markCodeAsUsed,
    cleanExpiredCodes,
    getResetStats
}; 