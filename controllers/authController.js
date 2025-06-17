const Usuario = require('../models/usuario');
const { generateToken } = require('../utils/jwt');
const PasswordReset = require('../models/passwordReset');

// Registro de usuario
exports.register = async (req, res) => {
    try {
        const { nombre, email, password, rol = 'empleado' } = req.body;

        // Validaciones básicas
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await Usuario.getUsuarioByEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Crear el usuario
        const userId = await Usuario.createUsuario(nombre, email, password, rol);
        
        // Obtener el usuario creado (sin la contraseña)
        const nuevoUsuario = await Usuario.getUsuarioById(userId);

        // Generar token
        const token = generateToken({
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: nuevoUsuario,
            token
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Login de usuario
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
        }

        // Buscar usuario por email
        const usuario = await Usuario.getUsuarioByEmail(email);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const passwordValida = await Usuario.validatePassword(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = generateToken({
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        });

        // Respuesta sin la contraseña
        const { password: _, ...usuarioSinPassword } = usuario;

        res.json({
            message: 'Login exitoso',
            usuario: usuarioSinPassword,
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
    try {
        const usuario = await Usuario.getUsuarioById(req.user.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            user: usuario
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
    try {
        const { nombre, email } = req.body;
        const userId = req.user.id;

        if (!nombre || !email) {
            return res.status(400).json({ error: 'Nombre y email son obligatorios' });
        }

        // Verificar si el nuevo email ya existe (y no es el mismo usuario)
        const usuarioConEmail = await Usuario.getUsuarioByEmail(email);
        if (usuarioConEmail && usuarioConEmail.id !== userId) {
            return res.status(400).json({ error: 'El email ya está en uso' });
        }

        await Usuario.updateUsuario(userId, nombre, email);
        const usuarioActualizado = await Usuario.getUsuarioById(userId);

        res.json({
            message: 'Perfil actualizado exitosamente',
            user: usuarioActualizado
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Contraseña actual y nueva son obligatorias' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }

        // Obtener usuario con contraseña
        const usuario = await Usuario.getUsuarioByEmail(req.user.email);
        
        // Verificar contraseña actual
        const passwordValida = await Usuario.validatePassword(currentPassword, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña
        await Usuario.updatePassword(userId, newPassword);

        res.json({
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Actualizar push token del usuario
exports.updatePushToken = async (req, res) => {
    try {
        const { pushToken } = req.body;
        const userId = req.user.id;

        if (!pushToken) {
            return res.status(400).json({ error: 'Push token es requerido' });
        }

        // Actualizar push token del usuario
        const updated = await Usuario.updatePushToken(userId, pushToken);

        if (updated === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            message: 'Push token actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando push token:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Solicitar código de recuperación de contraseña
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email es requerido' });
        }

        // Verificar si el usuario existe
        const usuario = await Usuario.getUsuarioByEmail(email);
        if (!usuario) {
            // Por seguridad, respondemos igual aunque el usuario no exista
            return res.json({
                message: 'Si el email existe, se enviará un código de recuperación',
                success: true
            });
        }

        // Verificar límite de intentos (máximo 3 códigos por día)
        const stats = await PasswordReset.getResetStats(email);
        if (stats.total >= 3) {
            return res.status(429).json({ 
                error: 'Límite de códigos diarios alcanzado. Intenta mañana.',
                nextAvailable: '24 horas'
            });
        }

        // Crear código de recuperación
        const resetData = await PasswordReset.createResetCode(email);

        // En un entorno real, aquí enviarías el código por email
        // Por ahora, lo devolvemos en la respuesta para pruebas
        console.log(`📧 Código de recuperación para ${email}: ${resetData.code}`);

        res.json({
            message: 'Código de recuperación generado',
            success: true,
            // SOLO PARA DESARROLLO - Remover en producción
            devCode: resetData.code,
            expiresIn: '30 minutos'
        });

    } catch (error) {
        console.error('Error en requestPasswordReset:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Verificar código de recuperación
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email y código son requeridos' });
        }

        // Validar código
        const resetRecord = await PasswordReset.validateResetCode(email, code);
        
        if (!resetRecord) {
            return res.status(400).json({ 
                error: 'Código inválido o expirado',
                details: 'Verifica el código o solicita uno nuevo'
            });
        }

        res.json({
            message: 'Código válido',
            success: true,
            resetId: resetRecord.id
        });

    } catch (error) {
        console.error('Error en verifyResetCode:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Resetear contraseña con código
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, código y nueva contraseña son requeridos' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Validar código nuevamente
        const resetRecord = await PasswordReset.validateResetCode(email, code);
        
        if (!resetRecord) {
            return res.status(400).json({ 
                error: 'Código inválido o expirado',
                details: 'El código ya fue usado o ha expirado'
            });
        }

        // Verificar que el usuario existe
        const usuario = await Usuario.getUsuarioByEmail(email);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Actualizar contraseña
        await Usuario.updatePassword(usuario.id, newPassword);

        // Marcar código como usado
        await PasswordReset.markCodeAsUsed(resetRecord.id);

        res.json({
            message: 'Contraseña actualizada exitosamente',
            success: true
        });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Registro público de empleados (requiere aprobación de admin en el futuro)
exports.publicRegister = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validaciones básicas
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await Usuario.getUsuarioByEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Crear el usuario con rol empleado por defecto
        const userId = await Usuario.createUsuario(nombre, email, password, 'empleado');
        
        // Obtener el usuario creado (sin la contraseña)
        const nuevoUsuario = await Usuario.getUsuarioById(userId);

        // Generar token
        const token = generateToken({
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        });

        res.status(201).json({
            message: 'Registro exitoso. Bienvenido como empleado.',
            user: nuevoUsuario,
            token,
            success: true
        });

    } catch (error) {
        console.error('Error en publicRegister:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}; 