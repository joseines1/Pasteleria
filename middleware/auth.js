const { verifyToken } = require('../utils/jwt');
const Usuario = require('../models/usuario');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Token de acceso requerido' });
        }

        const decoded = verifyToken(token);
        
        // Verificar que el usuario aún existe
        const usuario = await Usuario.getUsuarioById(decoded.id);
        if (!usuario) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Agregar información del usuario a la request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            nombre: usuario.nombre,
            rol: usuario.rol
        };

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(403).json({ error: 'Token inválido' });
    }
};

// Middleware opcional - no falla si no hay token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyToken(token);
            const usuario = await Usuario.getUsuarioById(decoded.id);
            
            if (usuario) {
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                };
            }
        }
        
        next();
    } catch (error) {
        // Si hay error con el token, simplemente continúa sin usuario
        next();
    }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Token de acceso requerido' });
        }

        const userRole = req.user.rol;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                error: 'No tienes permisos para acceder a este recurso',
                requiredRoles: allowedRoles,
                userRole: userRole
            });
        }

        next();
    };
};

// Middleware específico para administradores
const requireAdmin = requireRole('administrador');

// Middleware que permite tanto admin como empleado
const requireAuth = requireRole(['administrador', 'empleado']);

module.exports = {
    authenticateToken,
    optionalAuth,
    requireRole,
    requireAdmin,
    requireAuth
}; 