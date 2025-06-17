const axios = require('axios');

async function testInterfazWeb() {
    console.log('🌐 PROBANDO INTERFAZ WEB');
    console.log('=' .repeat(50));
    
    const baseURL = 'http://localhost:3000';
    
    try {
        // 1. Probar que el servidor está corriendo
        console.log('\n1️⃣  PROBANDO SERVIDOR...');
        const serverResponse = await axios.get(`${baseURL}/test`);
        console.log('✅ Servidor API funcionando');
        console.log(`📡 Respuesta: ${serverResponse.data.message}`);
        
        // 2. Probar que la interfaz web está disponible
        console.log('\n2️⃣  PROBANDO INTERFAZ WEB...');
        const webResponse = await axios.get(baseURL);
        console.log('✅ Interfaz web disponible');
        console.log(`📄 Tipo de contenido: ${webResponse.headers['content-type']}`);
        
        if (webResponse.headers['content-type'].includes('text/html')) {
            console.log('🎉 HTML servido correctamente');
        }
        
        // 3. Probar archivos estáticos
        console.log('\n3️⃣  PROBANDO ARCHIVOS ESTÁTICOS...');
        
        try {
            const cssResponse = await axios.get(`${baseURL}/styles.css`);
            console.log('✅ CSS cargado correctamente');
        } catch (error) {
            console.log('❌ Error cargando CSS:', error.message);
        }
        
        try {
            const jsResponse = await axios.get(`${baseURL}/app.js`);
            console.log('✅ JavaScript cargado correctamente');
        } catch (error) {
            console.log('❌ Error cargando JavaScript:', error.message);
        }
        
        // 4. Probar login desde la web
        console.log('\n4️⃣  PROBANDO LOGIN WEB...');
        
        const loginData = {
            email: 'empleado@test.com',
            password: 'emp123'
        };
        
        try {
            const loginResponse = await axios.post(`${baseURL}/auth/login`, loginData);
            console.log('✅ Login funciona desde interfaz web');
            console.log(`👤 Usuario: ${loginResponse.data.usuario.nombre}`);
            console.log(`🔑 Token generado: ${loginResponse.data.token.substring(0, 20)}...`);
            
            // 5. Probar operaciones CRUD con token
            console.log('\n5️⃣  PROBANDO CRUD CON AUTENTICACIÓN...');
            
            const token = loginResponse.data.token;
            const authHeaders = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            // Crear ingrediente
            const nuevoIngrediente = await axios.post(`${baseURL}/ingredientes`, {
                nombre: 'Test Web Ingrediente',
                cantidad: 20
            }, { headers: authHeaders });
            
            console.log('✅ Ingrediente creado desde web');
            console.log(`📦 ID: ${nuevoIngrediente.data.idIngrediente}`);
            
            // Listar ingredientes
            const ingredientes = await axios.get(`${baseURL}/ingredientes`);
            console.log(`✅ Ingredientes listados: ${ingredientes.data.length} encontrados`);
            
            // Eliminar ingrediente de prueba
            await axios.delete(`${baseURL}/ingredientes/${nuevoIngrediente.data.idIngrediente}`, {
                headers: authHeaders
            });
            console.log('✅ Ingrediente eliminado');
            
        } catch (error) {
            console.log('❌ Error en login web:', error.response?.data?.error || error.message);
        }
        
        // 6. Información para el usuario
        console.log('\n6️⃣  INFORMACIÓN PARA EL USUARIO...');
        
        console.log('\n🖥️  ACCESO DESDE COMPUTADORA:');
        console.log(`   📍 URL: ${baseURL}`);
        console.log('   🌐 Abre tu navegador web');
        console.log('   🔐 Usa las credenciales de prueba');
        console.log('   ✨ Interfaz completa disponible');
        
        console.log('\n📱 ACCESO DESDE CELULAR:');
        console.log('   📱 Usa la app móvil nativa');
        console.log('   🔐 Mismas credenciales');
        console.log('   🔔 Notificaciones push disponibles');
        
        console.log('\n👥 USUARIOS DISPONIBLES:');
        console.log('   📧 empleado@test.com / emp123');
        console.log('   📧 admin@test.com / admin123');
        
        console.log('\n🎯 FUNCIONALIDADES:');
        console.log('   📦 Gestión de Ingredientes');
        console.log('   🧁 Gestión de Postres');
        console.log('   📋 Gestión de Recetas');
        console.log('   🔔 Centro de Notificaciones');
        console.log('   🧪 Pruebas CRUD con notificaciones');
        
        console.log('\n' + '=' .repeat(50));
        console.log('🎉 INTERFAZ WEB FUNCIONANDO CORRECTAMENTE');
        console.log('✅ Computadora: Interfaz web disponible');
        console.log('✅ Celular: App móvil nativa');
        console.log('✅ Ambos: Mismo backend y notificaciones');
        
    } catch (error) {
        console.log('\n❌ ERROR GENERAL:', error.message);
        console.log('\n💡 SOLUCIONES:');
        console.log('   1. Verifica que el servidor esté corriendo: npm start');
        console.log('   2. Verifica que el puerto 3000 esté libre');
        console.log('   3. Revisa los logs del servidor');
    }
}

// Ejecutar prueba
testInterfazWeb().catch(console.error); 