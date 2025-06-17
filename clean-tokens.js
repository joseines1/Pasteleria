const Usuario = require('./models/usuario');

async function cleanInvalidTokens() {
    console.log('🧹 Limpiando tokens inválidos...\n');
    
    try {
        // Obtener todos los usuarios con tokens
        const allUsers = await Usuario.getAllUsuarios();
        const usersWithTokens = allUsers.filter(user => user.push_token);
        
        console.log(`📊 Usuarios con tokens: ${usersWithTokens.length}`);
        
        let cleanedCount = 0;
        
        for (const user of usersWithTokens) {
            const token = user.push_token;
            const isValid = token && token.startsWith('ExponentPushToken');
            
            console.log(`👤 ${user.nombre} (${user.rol}): ${token.substring(0, 20)}... - ${isValid ? '✅ Válido' : '❌ Inválido'}`);
            
            if (!isValid) {
                await Usuario.updatePushToken(user.id, null);
                cleanedCount++;
                console.log(`   🧹 Token inválido limpiado`);
            }
        }
        
        console.log(`\n✅ Limpieza completada: ${cleanedCount} tokens inválidos eliminados`);
        
    } catch (error) {
        console.error('❌ Error limpiando tokens:', error);
    }
    
    process.exit(0);
}

cleanInvalidTokens(); 