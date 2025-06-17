const mysql = require('mysql2/promise');

async function verificarTokens() {
    console.log('🔍 VERIFICANDO TOKENS PUSH REGISTRADOS...\n');
    
    try {
        // Conectar a la base de datos
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'pasteleria_db'
        });

        // Obtener todos los usuarios con sus tokens
        const [usuarios] = await connection.execute(`
            SELECT id, nombre, email, rol, pushToken, created_at 
            FROM usuarios 
            ORDER BY rol, id
        `);

        console.log('👥 USUARIOS REGISTRADOS:');
        console.log('========================');
        
        let adminTokens = 0;
        let empleadoTokens = 0;
        
        usuarios.forEach(usuario => {
            console.log(`📋 ID: ${usuario.id}`);
            console.log(`👤 Nombre: ${usuario.nombre}`);
            console.log(`📧 Email: ${usuario.email}`);
            console.log(`🏷️ Rol: ${usuario.rol}`);
            console.log(`📱 Token: ${usuario.pushToken || 'SIN TOKEN'}`);
            console.log(`📅 Creado: ${usuario.created_at}`);
            console.log('----------------------------');
            
            if (usuario.rol === 'administrador' && usuario.pushToken) {
                adminTokens++;
            }
            if (usuario.rol === 'empleado' && usuario.pushToken) {
                empleadoTokens++;
            }
        });

        console.log('\n📊 RESUMEN:');
        console.log(`🔴 Administradores con token: ${adminTokens}`);
        console.log(`🔵 Empleados con token: ${empleadoTokens}`);
        console.log(`📱 Total usuarios: ${usuarios.length}`);

        // Verificar tokens válidos de Expo
        console.log('\n🧪 VALIDACIÓN DE TOKENS:');
        console.log('========================');
        
        const tokensAdmin = usuarios.filter(u => u.rol === 'administrador' && u.pushToken);
        
        if (tokensAdmin.length === 0) {
            console.log('❌ NO HAY TOKENS DE ADMINISTRADOR REGISTRADOS');
            console.log('💡 SOLUCIÓN: El admin debe loguearse en la app móvil');
        } else {
            tokensAdmin.forEach((admin, index) => {
                console.log(`✅ Admin ${index + 1}: ${admin.nombre}`);
                console.log(`   📱 Token: ${admin.pushToken}`);
                
                // Verificar formato de token Expo
                if (admin.pushToken.startsWith('ExponentPushToken[')) {
                    console.log('   ✅ Formato válido de Expo');
                } else {
                    console.log('   ❌ Formato inválido de token');
                }
            });
        }

        await connection.end();
        
    } catch (error) {
        console.error('❌ Error verificando tokens:', error.message);
    }
}

verificarTokens(); 