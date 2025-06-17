const { getAllUsuarios, getAdminPushTokens } = require('./models/usuario');

async function verifyPushTokens() {
    try {
        console.log('🔍 Verificando push tokens en la base de datos...\n');
        
        // Obtener todos los usuarios
        const usuarios = await getAllUsuarios();
        console.log(`📊 Total de usuarios: ${usuarios.length}\n`);
        
        // Mostrar información de cada usuario
        usuarios.forEach((user, index) => {
            console.log(`👤 Usuario ${index + 1}:`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Nombre: ${user.nombre}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Rol: ${user.rol}`);
            console.log(`   Push Token: ${user.push_token || 'No asignado'}`);
            console.log('');
        });
        
        // Obtener tokens de administradores y empleados
        const adminTokens = await getAdminPushTokens();
        console.log(`🔔 Push tokens activos (admin/empleados): ${adminTokens.length}`);
        
        if (adminTokens.length > 0) {
            console.log('📱 Tokens encontrados:');
            adminTokens.forEach((token, index) => {
                console.log(`   ${index + 1}. ${token}`);
            });
        } else {
            console.log('❌ No se encontraron push tokens activos');
        }
        
        console.log('\n✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error verificando push tokens:', error);
    }
}

// Ejecutar el script
verifyPushTokens(); 