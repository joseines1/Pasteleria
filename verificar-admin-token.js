const axios = require('axios');

async function verificarAdminToken() {
    console.log('🔍 VERIFICANDO TOKEN DEL ADMINISTRADOR\n');
    
    try {
        const response = await axios.post('http://localhost:3000/auth/login', {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        if (response.data && response.data.usuario) {
            const admin = response.data.usuario;
            
            console.log('✅ LOGIN ADMINISTRADOR EXITOSO');
            console.log('================================');
            console.log(`👤 Nombre: ${admin.nombre}`);
            console.log(`📧 Email: ${admin.email}`);
            console.log(`🏷️ Rol: ${admin.rol}`);
            console.log(`📱 Token Push: ${admin.pushToken || 'NO REGISTRADO'}`);
            console.log(`🆔 ID Usuario: ${admin.id}`);
            
            if (!admin.pushToken) {
                console.log('\n❌ PROBLEMA IDENTIFICADO:');
                console.log('==========================');
                console.log('El administrador NO tiene token push registrado');
                console.log('');
                console.log('📋 PASOS PARA SOLUCIONARLO:');
                console.log('1. 📱 En el celular del ADMINISTRADOR:');
                console.log('   - Abrir Expo Go');
                console.log('   - Escanear el QR del metro bundler');
                console.log('   - Esperar que cargue la app completamente');
                console.log('');
                console.log('2. 🔐 HACER LOGIN:');
                console.log('   - Email: admin@test.com');
                console.log('   - Password: admin123');
                console.log('');
                console.log('3. 🔔 PERMITIR NOTIFICACIONES:');
                console.log('   - Cuando aparezca el popup de permisos');
                console.log('   - Tocar "Permitir" o "Allow"');
                console.log('');
                console.log('4. 📱 MINIMIZAR LA APP:');
                console.log('   - Presionar botón home del celular');
                console.log('   - Dejar la app en segundo plano');
                console.log('');
                console.log('5. ✅ PROBAR NOTIFICACIONES:');
                console.log('   - Desde el celular del empleado');
                console.log('   - Crear/editar/eliminar ingredientes o postres');
                console.log('   - Las notificaciones deberían llegar al admin');
                
            } else {
                console.log('\n✅ ADMINISTRADOR CONFIGURADO CORRECTAMENTE');
                console.log('==========================================');
                console.log('El administrador tiene token push registrado');
                console.log('Las notificaciones deberían funcionar');
                console.log('');
                console.log('💡 Si no recibe notificaciones, verificar:');
                console.log('1. La app del admin está en segundo plano');
                console.log('2. Los permisos de notificación están activados');
                console.log('3. Ambos celulares están en la misma WiFi');
            }
            
        } else {
            console.log('❌ Error en la respuesta del login');
        }
        
    } catch (error) {
        console.error('❌ Error verificando admin:', error.message);
        if (error.response) {
            console.error('Detalles:', error.response.data);
        }
    }
}

// También verificar empleado
async function verificarEmpleadoToken() {
    console.log('\n\n🔍 VERIFICANDO TOKEN DEL EMPLEADO\n');
    
    try {
        const response = await axios.post('http://localhost:3000/auth/login', {
            email: 'empleado@test.com',
            password: 'emp123'
        });
        
        if (response.data && response.data.usuario) {
            const empleado = response.data.usuario;
            
            console.log('✅ LOGIN EMPLEADO EXITOSO');
            console.log('===========================');
            console.log(`👤 Nombre: ${empleado.nombre}`);
            console.log(`📧 Email: ${empleado.email}`);
            console.log(`🏷️ Rol: ${empleado.rol}`);
            console.log(`📱 Token Push: ${empleado.pushToken || 'NO REGISTRADO'}`);
            console.log(`🆔 ID Usuario: ${empleado.id}`);
            
        } else {
            console.log('❌ Error en la respuesta del login del empleado');
        }
        
    } catch (error) {
        console.error('❌ Error verificando empleado:', error.message);
    }
}

async function ejecutarVerificacion() {
    await verificarAdminToken();
    await verificarEmpleadoToken();
}

ejecutarVerificacion(); 