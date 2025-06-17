const { getAllUsuarios, updatePushToken } = require('./models/usuario');

async function assignPushTokenToAdmin() {
    try {
        console.log('🔍 Buscando usuarios administradores...');
        
        // Obtener todos los usuarios
        const usuarios = await getAllUsuarios();
        console.log('Usuarios encontrados:', usuarios.length);
        
        // Buscar administradores
        const administradores = usuarios.filter(user => user.rol === 'administrador');
        console.log('Administradores encontrados:', administradores.length);
        
        if (administradores.length === 0) {
            console.log('❌ No se encontraron usuarios administradores');
            return;
        }
        
        // Push token válido de ejemplo (formato ExponentPushToken)
        const pushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
        
        // Asignar push token a cada administrador
        for (const admin of administradores) {
            console.log(`\n👤 Procesando administrador: ${admin.nombre} (${admin.email})`);
            console.log(`   ID: ${admin.id}`);
            console.log(`   Push token actual: ${admin.push_token || 'ninguno'}`);
            
            const result = await updatePushToken(admin.id, pushToken);
            
            if (result > 0) {
                console.log(`✅ Push token asignado exitosamente`);
                console.log(`   Nuevo token: ${pushToken}`);
            } else {
                console.log(`❌ Error asignando push token`);
            }
        }
        
        console.log('\n🎉 Proceso completado');
        
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    }
}

// Ejecutar el script
assignPushTokenToAdmin(); 