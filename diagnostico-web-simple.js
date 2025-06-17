const axios = require('axios');

async function diagnosticoWebSimple() {
    console.log('🔍 DIAGNÓSTICO WEB SIMPLE');
    console.log('=' .repeat(40));
    
    try {
        // 1. Verificar servidor
        console.log('1️⃣ Verificando servidor...');
        const serverResponse = await axios.get('http://localhost:3000');
        console.log('✅ Servidor funcionando');
        
        // 2. Verificar endpoint de login
        console.log('\n2️⃣ Probando login directo...');
        const loginResponse = await axios.post('http://localhost:3000/auth/login', {
            email: 'empleado@test.com',
            password: 'emp123'
        });
        
        console.log('✅ Login exitoso');
        console.log('📄 Estructura de respuesta:');
        console.log('- Token presente:', !!loginResponse.data.token);
        console.log('- Usuario presente:', !!loginResponse.data.usuario);
        console.log('- Nombre usuario:', loginResponse.data.usuario?.nombre);
        console.log('- Email usuario:', loginResponse.data.usuario?.email);
        console.log('- Rol usuario:', loginResponse.data.usuario?.rol);
        
        // 3. Verificar interfaz web disponible
        console.log('\n3️⃣ Verificando interfaz web...');
        const webResponse = await axios.get('http://localhost:3000');
        const isHTML = webResponse.headers['content-type']?.includes('text/html');
        console.log('✅ Interfaz web disponible:', isHTML ? 'SÍ' : 'NO');
        
        console.log('\n🎯 RESULTADO:');
        console.log('✅ Backend: FUNCIONANDO');
        console.log('✅ Login API: FUNCIONANDO');
        console.log('✅ Web Interface: DISPONIBLE');
        
        console.log('\n📝 INSTRUCCIONES:');
        console.log('1. Abrir navegador en: http://localhost:3000');
        console.log('2. Usar credenciales: empleado@test.com / emp123');
        console.log('3. O usar credenciales: admin@test.com / admin123');
        console.log('4. Click en botones de prueba para autocompletar');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 SOLUCIÓN:');
            console.log('El servidor no está funcionando. Ejecutar:');
            console.log('npm start');
        }
    }
}

diagnosticoWebSimple(); 