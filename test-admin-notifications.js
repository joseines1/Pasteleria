const PushNotificationService = require('./services/pushNotificationService');
const Usuario = require('./models/usuario');

async function testAdminNotifications() {
    console.log('🧪 === PROBANDO NOTIFICACIONES SOLO PARA ADMINISTRADORES ===\n');

    try {
        // 1. Verificar usuarios administradores
        console.log('1️⃣ Verificando administradores...');
        const allUsers = await Usuario.getAllUsuarios();
        const admins = allUsers.filter(user => user.rol === 'administrador');
        const employees = allUsers.filter(user => user.rol === 'empleado');
        
        console.log(`   - Total usuarios: ${allUsers.length}`);
        console.log(`   - Administradores: ${admins.length}`);
        console.log(`   - Empleados: ${employees.length}`);
        
        if (admins.length === 0) {
            console.log('❌ No hay administradores en el sistema');
            return;
        }

        // 2. Verificar administradores con tokens
        console.log('\n2️⃣ Verificando tokens de administradores...');
        const adminsWithTokens = await Usuario.getAdministradoresConTokens();
        
        console.log(`   - Administradores con tokens: ${adminsWithTokens.length}`);
        
        if (adminsWithTokens.length === 0) {
            console.log('⚠️  No hay administradores con tokens push');
            console.log('💡 Los administradores deben iniciar sesión en la app móvil');
            
            // Mostrar qué administradores no tienen tokens
            const adminsWithoutTokens = admins.filter(admin => !admin.push_token);
            console.log('\n   📝 Administradores sin tokens:');
            adminsWithoutTokens.forEach(admin => {
                console.log(`      - ${admin.nombre} (${admin.email})`);
            });
            return;
        }

        // 3. Mostrar administradores que recibirán notificaciones
        console.log('\n   📱 Administradores que recibirán notificaciones:');
        adminsWithTokens.forEach(admin => {
            console.log(`      - ${admin.nombre} (${admin.email})`);
        });

        // 4. Enviar notificación de prueba
        console.log('\n3️⃣ Enviando notificación de prueba...');
        
        const result = await PushNotificationService.sendToAdmins(
            '🧪 Prueba Admin-Only',
            'Esta notificación debe llegar SOLO a administradores',
            {
                module: 'test-admin-only',
                timestamp: new Date().toISOString(),
                testType: 'admin-only-verification'
            }
        );

        // 5. Mostrar resultados
        console.log('\n4️⃣ Resultados del envío:');
        console.log(`   ✅ Notificaciones enviadas: ${result.sent}`);
        console.log(`   ❌ Errores: ${result.errors}`);
        console.log(`   📊 Total tokens procesados: ${result.totalTokens}`);

        if (result.sent > 0) {
            console.log('\n🎉 ¡ÉXITO! Las notificaciones se enviaron solo a administradores');
        } else {
            console.log('\n⚠️  No se pudieron enviar notificaciones');
            console.log('💡 Revisa que los administradores tengan tokens válidos');
        }

        // 6. Verificar que NO se enviaron a empleados
        console.log('\n5️⃣ Verificación de exclusión de empleados:');
        if (employees.length > 0) {
            console.log(`   ✅ Los ${employees.length} empleados NO recibieron notificaciones`);
            console.log('   📝 Empleados en el sistema:');
            employees.forEach(emp => {
                console.log(`      - ${emp.nombre} (${emp.email}) - Token: ${emp.push_token ? 'SÍ' : 'NO'}`);
            });
        } else {
            console.log('   ℹ️  No hay empleados en el sistema');
        }

    } catch (error) {
        console.error('❌ Error ejecutando prueba:', error);
    }

    console.log('\n🔚 === FIN DE LA PRUEBA ===');
}

// Ejecutar la prueba
if (require.main === module) {
    testAdminNotifications()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = { testAdminNotifications }; 