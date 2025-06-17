const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function diagnosticoNotificaciones() {
    console.log('🔍 DIAGNÓSTICO DE NOTIFICACIONES PUSH\n');
    
    try {
        // 1. Verificar que el servidor esté corriendo
        console.log('1️⃣ Verificando servidor...');
        const serverCheck = await axios.get(`${API_BASE}/test`);
        console.log('✅ Servidor funcionando\n');
        
        // 2. Login como empleado para hacer CRUD
        console.log('2️⃣ Login como empleado...');
        const loginEmpleado = await axios.post(`${API_BASE}/auth/login`, {
            email: 'empleado@test.com',
            password: 'emp123'
        });
        
        if (loginEmpleado.data.success) {
            console.log(`✅ Login empleado exitoso: ${loginEmpleado.data.user.nombre}`);
            console.log(`📱 Token empleado: ${loginEmpleado.data.user.pushToken || 'SIN TOKEN'}\n`);
        }
        
        // 3. Login como admin para verificar tokens
        console.log('3️⃣ Verificando login de administrador...');
        const loginAdmin = await axios.post(`${API_BASE}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        
        if (loginAdmin.data.success) {
            console.log(`✅ Login admin exitoso: ${loginAdmin.data.user.nombre}`);
            console.log(`📱 Token admin: ${loginAdmin.data.user.pushToken || 'SIN TOKEN'}`);
            
            if (!loginAdmin.data.user.pushToken) {
                console.log('❌ PROBLEMA ENCONTRADO: El admin NO tiene token push');
                console.log('💡 SOLUCIÓN: El administrador debe:');
                console.log('   1. Loguearse en la app móvil');
                console.log('   2. Permitir notificaciones cuando se solicite');
                console.log('   3. Mantener la app en segundo plano\n');
            } else {
                console.log('✅ Admin tiene token push válido\n');
            }
        }
        
        // 4. Crear un ingrediente de prueba para generar notificación
        console.log('4️⃣ Creando ingrediente de prueba para generar notificación...');
        const token = loginEmpleado.data.token;
        
        const nuevoIngrediente = await axios.post(`${API_BASE}/ingredientes`, {
            nombre: 'Ingrediente Diagnóstico',
            cantidad: 5,
            unidad: 'kg'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (nuevoIngrediente.data.success) {
            console.log('✅ Ingrediente creado exitosamente');
            console.log('📤 Se debería haber enviado notificación a administradores');
            
            // 5. Eliminar el ingrediente de prueba
            console.log('\n5️⃣ Limpiando ingrediente de prueba...');
            const idIngrediente = nuevoIngrediente.data.idIngrediente;
            
            await axios.delete(`${API_BASE}/ingredientes/${idIngrediente}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ Ingrediente de prueba eliminado');
        }
        
        console.log('\n📋 RESUMEN DEL DIAGNÓSTICO:');
        console.log('==========================');
        console.log('✅ Servidor funcionando');
        console.log('✅ Login de empleado funcionando');
        console.log('✅ Login de administrador funcionando');
        console.log('✅ Creación de ingredientes funcionando');
        console.log('');
        console.log('🔍 PASOS PARA SOLUCIONAR NOTIFICACIONES:');
        console.log('1. 📱 CELULAR ADMIN: Abrir Expo Go');
        console.log('2. 📱 CELULAR ADMIN: Escanear QR del servidor');
        console.log('3. 📱 CELULAR ADMIN: Login con admin@test.com / admin123');
        console.log('4. 📱 CELULAR ADMIN: Permitir notificaciones');
        console.log('5. 📱 CELULAR ADMIN: Minimizar app (segundo plano)');
        console.log('6. 📱 CELULAR EMPLEADO: Hacer operaciones CRUD');
        console.log('7. 📱 CELULAR ADMIN: Recibir notificaciones');
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error.message);
        
        if (error.response) {
            console.error('📋 Detalles del error:', error.response.data);
        }
    }
}

diagnosticoNotificaciones(); 