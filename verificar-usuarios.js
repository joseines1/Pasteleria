const Usuario = require('./models/usuario');

async function verificarUsuarios() {
    console.log('👥 VERIFICANDO USUARIOS EN LA BASE DE DATOS');
    console.log('=' .repeat(50));
    
    try {
        // Obtener todos los usuarios
        const usuarios = await Usuario.getAllUsuarios();
        
        console.log(`📊 Total de usuarios: ${usuarios.length}`);
        console.log('');
        
        if (usuarios.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
            console.log('💡 Necesitas crear al menos un usuario para probar las notificaciones');
            return;
        }
        
        console.log('👤 USUARIOS ENCONTRADOS:');
        usuarios.forEach((usuario, index) => {
            console.log(`${index + 1}. ${usuario.nombre}`);
            console.log(`   📧 Email: ${usuario.email}`);
            console.log(`   👔 Rol: ${usuario.rol}`);
            console.log(`   📱 Push Token: ${usuario.pushToken ? 'Sí' : 'No'}`);
            console.log('');
        });
        
        // Buscar administradores
        const administradores = usuarios.filter(u => u.rol === 'administrador');
        const empleados = usuarios.filter(u => u.rol === 'empleado');
        
        console.log('📊 RESUMEN:');
        console.log(`   👑 Administradores: ${administradores.length}`);
        console.log(`   👷 Empleados: ${empleados.length}`);
        
        // Verificar tokens de push
        const usuariosConToken = usuarios.filter(u => u.pushToken);
        console.log(`   📱 Con Push Token: ${usuariosConToken.length}`);
        
        if (usuariosConToken.length === 0) {
            console.log('');
            console.log('⚠️  NINGÚN USUARIO TIENE TOKEN DE PUSH');
            console.log('💡 Para recibir notificaciones, necesitas:');
            console.log('   1. Abrir la app móvil');
            console.log('   2. Iniciar sesión');
            console.log('   3. Permitir notificaciones');
            console.log('   4. El token se generará automáticamente');
        }
        
        console.log('');
        console.log('🔧 PARA PROBAR NOTIFICACIONES:');
        if (empleados.length > 0) {
            const empleado = empleados[0];
            console.log(`   📧 Usa este empleado: ${empleado.email}`);
            console.log('   🔑 Contraseña: (la que configuraste al registrarlo)');
            console.log('   💡 Si no recuerdas la contraseña, crea un nuevo usuario');
        } else {
            console.log('   ❌ No hay empleados registrados');
            console.log('   💡 Crea un empleado para probar las notificaciones');
        }
        
    } catch (error) {
        console.error('❌ Error verificando usuarios:', error);
    }
}

// Función para crear un usuario de prueba con credenciales conocidas
async function crearUsuarioPrueba() {
    console.log('\n👤 CREANDO USUARIO DE PRUEBA...');
    
    try {
        const nuevoUsuario = await Usuario.createUsuario(
            'Empleado Test',
            'empleado.test@pasteleria.com',
            'test123',
            'empleado'
        );
        
        console.log('✅ Usuario de prueba creado exitosamente:');
        console.log(`   📧 Email: empleado.test@pasteleria.com`);
        console.log(`   🔑 Contraseña: test123`);
        console.log(`   👔 Rol: empleado`);
        
    } catch (error) {
        if (error.message.includes('ya está registrado')) {
            console.log('ℹ️  El usuario de prueba ya existe');
            console.log('   📧 Email: empleado.test@pasteleria.com');
            console.log('   🔑 Contraseña: test123');
        } else {
            console.error('❌ Error creando usuario de prueba:', error.message);
        }
    }
}

async function main() {
    await verificarUsuarios();
    await crearUsuarioPrueba();
}

main().catch(console.error); 