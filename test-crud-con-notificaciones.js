const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Configuración de usuario de prueba (actualizado con credenciales conocidas)
const testUser = {
    email: 'empleado.test@pasteleria.com',
    password: 'test123'
};

let authToken = null;

async function login() {
    try {
        console.log('🔐 Iniciando sesión...');
        const response = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
        authToken = response.data.token;
        console.log('✅ Sesión iniciada correctamente');
        console.log(`👤 Usuario: ${response.data.user.nombre} (${response.data.user.rol})`);
        return true;
    } catch (error) {
        console.log('❌ Error al iniciar sesión:', error.response?.data?.error || error.message);
        console.log('💡 Asegúrate de que existe un usuario con email: empleado.test@pasteleria.com');
        return false;
    }
}

async function makeAuthenticatedRequest(method, url, data = null) {
    const config = {
        method,
        url: `${API_BASE_URL}${url}`,
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        config.data = data;
    }
    
    return axios(config);
}

async function testCRUDNotifications() {
    console.log('🧪 PRUEBA DE NOTIFICACIONES CRUD');
    console.log('=' .repeat(50));
    
    // 1. Iniciar sesión
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('❌ No se puede continuar sin autenticación');
        return;
    }
    
    console.log('\n📱 Verificando tokens de push disponibles...');
    try {
        const Usuario = require('./models/usuario');
        const tokens = await Usuario.getAdminPushTokens();
        console.log(`📊 Tokens disponibles: ${tokens.length}`);
        
        if (tokens.length === 0) {
            console.log('⚠️  No hay tokens de push registrados');
            console.log('💡 Asegúrate de que al menos un administrador tenga un token válido');
            console.log('💡 Ejecuta: node solucion-notificaciones-movil.js para más información');
        }
    } catch (error) {
        console.log('❌ Error verificando tokens:', error.message);
    }
    
    try {
        // 2. Crear ingrediente (debería enviar notificación)
        console.log('\n1️⃣  CREANDO INGREDIENTE...');
        const nuevoIngrediente = await makeAuthenticatedRequest('POST', '/ingredientes', {
            nombreIngrediente: 'Chocolate Premium Test',
            existencias: 25
        });
        console.log('✅ Ingrediente creado:', nuevoIngrediente.data);
        console.log('📤 Notificación enviada a administradores');
        
        // 3. Actualizar ingrediente (debería enviar notificación)
        console.log('\n2️⃣  ACTUALIZANDO INGREDIENTE...');
        const ingredienteActualizado = await makeAuthenticatedRequest('PUT', `/ingredientes/${nuevoIngrediente.data.idIngrediente}`, {
            nombreIngrediente: 'Chocolate Premium Actualizado',
            existencias: 30
        });
        console.log('✅ Ingrediente actualizado:', ingredienteActualizado.data);
        console.log('📤 Notificación enviada a administradores');
        
        // 4. Crear postre (debería enviar notificación)
        console.log('\n3️⃣  CREANDO POSTRE...');
        const nuevoPostre = await makeAuthenticatedRequest('POST', '/postres', {
            nombrePostre: 'Torta de Chocolate Test'
        });
        console.log('✅ Postre creado:', nuevoPostre.data);
        console.log('📤 Notificación enviada a administradores');
        
        // 5. Crear relación postre-ingrediente (debería enviar notificación)
        console.log('\n4️⃣  CREANDO RECETA...');
        const nuevaReceta = await makeAuthenticatedRequest('POST', '/postres-ingredientes', {
            idPostre: nuevoPostre.data.idPostre,
            idIngrediente: nuevoIngrediente.data.idIngrediente,
            Cantidad: 2.5
        });
        console.log('✅ Receta creada:', nuevaReceta.data);
        console.log('📤 Notificación enviada a administradores');
        
        // 6. Actualizar receta (debería enviar notificación)
        console.log('\n5️⃣  ACTUALIZANDO RECETA...');
        const recetaActualizada = await makeAuthenticatedRequest('PUT', `/postres-ingredientes/${nuevaReceta.data.id}`, {
            idPostre: nuevoPostre.data.idPostre,
            idIngrediente: nuevoIngrediente.data.idIngrediente,
            Cantidad: 3.0
        });
        console.log('✅ Receta actualizada:', recetaActualizada.data);
        console.log('📤 Notificación enviada a administradores');
        
        // 7. Eliminar receta (debería enviar notificación)
        console.log('\n6️⃣  ELIMINANDO RECETA...');
        const recetaEliminada = await makeAuthenticatedRequest('DELETE', `/postres-ingredientes/${nuevaReceta.data.id}`);
        console.log('✅ Receta eliminada:', recetaEliminada.data);
        console.log('📤 Notificación enviada a administradores');
        
        // 8. Eliminar postre (debería enviar notificación)
        console.log('\n7️⃣  ELIMINANDO POSTRE...');
        const postreEliminado = await makeAuthenticatedRequest('DELETE', `/postres/${nuevoPostre.data.idPostre}`);
        console.log('✅ Postre eliminado:', postreEliminado.data);
        console.log('📤 Notificación enviada a administradores');
        
        // 9. Eliminar ingrediente (debería enviar notificación)
        console.log('\n8️⃣  ELIMINANDO INGREDIENTE...');
        const ingredienteEliminado = await makeAuthenticatedRequest('DELETE', `/ingredientes/${nuevoIngrediente.data.idIngrediente}`);
        console.log('✅ Ingrediente eliminado:', ingredienteEliminado.data);
        console.log('📤 Notificación enviada a administradores');
        
        console.log('\n' + '=' .repeat(50));
        console.log('🎉 PRUEBA COMPLETADA EXITOSAMENTE');
        console.log('✅ Todas las operaciones CRUD ejecutadas');
        console.log('📱 8 notificaciones enviadas a administradores');
        console.log('💡 Verifica tu dispositivo móvil para confirmar la recepción');
        
    } catch (error) {
        console.error('\n❌ Error durante la prueba:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('🔐 Error de autenticación - Token inválido o expirado');
        } else if (error.response?.status === 403) {
            console.log('🚫 Error de autorización - Permisos insuficientes');
        }
    }
}

// Función para crear usuario de prueba si no existe
async function createTestUser() {
    try {
        console.log('👤 Creando usuario de prueba...');
        await axios.post(`${API_BASE_URL}/auth/register`, {
            nombre: 'Usuario Test',
            email: testUser.email,
            password: testUser.password,
            rol: 'empleado'
        });
        console.log('✅ Usuario de prueba creado');
    } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.includes('ya existe')) {
            console.log('ℹ️  Usuario de prueba ya existe');
        } else {
            console.log('❌ Error creando usuario de prueba:', error.response?.data?.error || error.message);
        }
    }
}

async function main() {
    console.log('🚀 INICIANDO PRUEBA DE NOTIFICACIONES CRUD CON AUTENTICACIÓN');
    console.log('=' .repeat(60));
    
    // Crear usuario de prueba si no existe
    await createTestUser();
    
    // Ejecutar pruebas
    await testCRUDNotifications();
}

// Ejecutar prueba
main().catch(console.error); 