const axios = require('axios');
const os = require('os');

async function testConexionMovil() {
    console.log('📱 PROBANDO CONEXIÓN MÓVIL');
    console.log('=' .repeat(50));
    
    // Obtener todas las IPs de la computadora
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    Object.keys(interfaces).forEach(interfaceName => {
        interfaces[interfaceName].forEach(interface => {
            if (interface.family === 'IPv4' && !interface.internal) {
                ips.push(interface.address);
            }
        });
    });
    
    console.log('🌐 IPs disponibles en esta computadora:');
    ips.forEach(ip => console.log(`   📍 ${ip}`));
    console.log('');
    
    // Probar cada IP
    for (const ip of ips) {
        const url = `http://${ip}:3000`;
        console.log(`🧪 Probando: ${url}`);
        
        try {
            const response = await axios.get(url, { timeout: 5000 });
            console.log(`✅ FUNCIONA: ${ip}:3000`);
            console.log(`📱 Configurar app móvil con: http://${ip}:3000`);
            
            // Probar login
            try {
                const loginResponse = await axios.post(`${url}/auth/login`, {
                    email: 'empleado@test.com',
                    password: 'emp123'
                }, { timeout: 5000 });
                
                console.log(`✅ Login funciona en: ${ip}:3000`);
                console.log('🎯 ¡ESTA ES LA IP CORRECTA PARA LA APP MÓVIL!');
            } catch (loginError) {
                console.log(`⚠️  Servidor responde pero login falla en: ${ip}:3000`);
            }
            
        } catch (error) {
            console.log(`❌ No funciona: ${ip}:3000 (${error.message})`);
        }
        console.log('');
    }
    
    console.log('📋 INSTRUCCIONES:');
    console.log('1. Usar la IP que muestra "✅ FUNCIONA" en mi-app/services/api.js');
    console.log('2. Asegurar que el celular esté en la misma red WiFi');
    console.log('3. Si usas hotspot móvil, conectar computadora y celular al mismo hotspot');
    console.log('4. Reiniciar la app móvil después del cambio');
}

testConexionMovil().catch(console.error); 