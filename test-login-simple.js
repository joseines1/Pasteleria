const axios = require('axios');

async function testLogin() {
    console.log('🔐 PROBANDO LOGIN DIRECTO');
    console.log('=' .repeat(40));
    
    const testCredentials = [
        { email: 'empleado@test.com', password: 'emp123', name: 'Empleado' },
        { email: 'admin@test.com', password: 'admin123', name: 'Admin' }
    ];
    
    for (const cred of testCredentials) {
        try {
            console.log(`\n🧪 Probando: ${cred.name} (${cred.email})`);
            
            const response = await axios.post('http://localhost:3000/auth/login', {
                email: cred.email,
                password: cred.password
            });
            
            console.log('✅ Login exitoso');
            console.log('📄 Respuesta completa:', JSON.stringify(response.data, null, 2));
            
            if (response.data.usuario) {
                console.log(`👤 Usuario: ${response.data.usuario.nombre}`);
                console.log(`📧 Email: ${response.data.usuario.email}`);
                console.log(`👔 Rol: ${response.data.usuario.rol}`);
            }
            
            if (response.data.token) {
                console.log(`🔑 Token: ${response.data.token.substring(0, 20)}...`);
            }
            
        } catch (error) {
            console.log(`❌ Error con ${cred.name}:`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Error: ${error.response.data.error}`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
        }
    }
}

testLogin().catch(console.error); 