const { getAllUsuarios, updatePushToken } = require('./models/usuario');

async function assignRealisticPushToken() {
    try {
        console.log('🔍 Asignando push token realista al administrador...');
        
        // Obtener todos los usuarios
        const usuarios = await getAllUsuarios();
        
        // Buscar administradores
        const administradores = usuarios.filter(user => user.rol === 'administrador');
        
        if (administradores.length === 0) {
            console.log('❌ No se encontraron usuarios administradores');
            return;
        }
        
        // Push token más realista (formato que usa Expo)
        const pushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
        
        // Generar un token más realista
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let realisticToken = '';
        for (let i = 0; i < 22; i++) {
            realisticToken += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        const finalToken = `ExponentPushToken[${realisticToken}]`;
        
        // Asignar push token al administrador
        const admin = administradores[0];
        console.log(`\n👤 Asignando token a: ${admin.nombre} (${admin.email})`);
        console.log(`   ID: ${admin.id}`);
        
        const result = await updatePushToken(admin.id, finalToken);
        
        if (result > 0) {
            console.log(`✅ Push token realista asignado exitosamente`);
            console.log(`   Token: ${finalToken}`);
        } else {
            console.log(`❌ Error asignando push token`);
        }
        
        console.log('\n🎉 Proceso completado');
        
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    }
}

// Ejecutar el script
assignRealisticPushToken(); 