const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido');
    }
}

function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    JWT_SECRET
}; 