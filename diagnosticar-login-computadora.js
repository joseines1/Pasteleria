const axios = require('axios');
const Usuario = require('./models/usuario');

async function diagnosticarLoginComputadora() {
    console.log('🔍 DIAGNÓSTICO DE LOGIN EN COMPUTADORA');
    console.log('=' .repeat(50));
    
    // 1. Verificar si el servidor está corriendo
    console.log('\n1️⃣  VERIFICANDO SERVIDOR...');
    
    try {
        const response = await axios.get('http://localhost:3000/test');
        console.log('✅ Servidor API corriendo en localhost:3000');
        console.log(`📡 Respuesta: ${response.data.message}`);
    } catch (error) {
        console.log('❌ Error conectando al servidor API:', error.message);
        console.log('💡 Asegúrate de que el servidor esté corriendo: npm start');
        return;
    }
    
    // 2. Verificar usuarios disponibles
    console.log('\n2️⃣  VERIFICANDO USUARIOS...');
    try {
        const usuarios = await Usuario.getAllUsuarios();
        console.log(`📊 Total usuarios: ${usuarios.length}`);
        
        const administradores = usuarios.filter(u => u.rol === 'administrador');
        const empleados = usuarios.filter(u => u.rol === 'empleado');
        
        console.log(`👑 Administradores: ${administradores.length}`);
        console.log(`👷 Empleados: ${empleados.length}`);
        
        if (administradores.length > 0) {
            console.log('\n📧 ADMINISTRADORES:');
            administradores.forEach((admin, index) => {
                console.log(`   ${index + 1}. ${admin.nombre} (${admin.email})`);
            });
        }
        
        if (empleados.length > 0) {
            console.log('\n📧 EMPLEADOS:');
            empleados.slice(0, 3).forEach((emp, index) => {
                console.log(`   ${index + 1}. ${emp.nombre} (${emp.email})`);
            });
        }
        
    } catch (error) {
        console.log('❌ Error verificando usuarios:', error.message);
    }
    
    // 3. Probar login con diferentes usuarios
    console.log('\n3️⃣  PROBANDO LOGIN CON DIFERENTES USUARIOS...');
    
    const testUsers = [
        { email: 'admin@pasteleria.com', password: 'admin123', tipo: 'Administrador' },
        { email: 'empleado@pasteleria.com', password: 'empleado123', tipo: 'Empleado' },
        { email: 'empleado.test@pasteleria.com', password: 'test123', tipo: 'Empleado Test' }
    ];
    
    for (const user of testUsers) {
        try {
            console.log(`\n🔐 Probando login: ${user.tipo} (${user.email})`);
            const response = await axios.post('http://localhost:3000/auth/login', {
                email: user.email,
                password: user.password
            });
            
            console.log(`✅ Login exitoso para ${user.tipo}`);
            console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
            console.log(`   Usuario: ${response.data.usuario.nombre}`);
            console.log(`   Rol: ${response.data.usuario.rol}`);
            
        } catch (error) {
            console.log(`❌ Login falló para ${user.tipo}:`);
            if (error.response) {
                console.log(`   Error: ${error.response.data.error}`);
                console.log(`   Status: ${error.response.status}`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
        }
    }
    
    // 4. Verificar si hay una interfaz web
    console.log('\n4️⃣  VERIFICANDO INTERFAZ WEB...');
    
    try {
        const response = await axios.get('http://localhost:3000/');
        console.log('✅ Interfaz web disponible en localhost:3000');
        console.log(`📄 Tipo de contenido: ${response.headers['content-type']}`);
        
        // Verificar si es HTML
        if (response.headers['content-type']?.includes('text/html')) {
            console.log('📱 Es una página HTML - interfaz web disponible');
        } else {
            console.log('📊 No es HTML - solo API disponible');
        }
        
    } catch (error) {
        console.log('❌ No hay interfaz web disponible');
        console.log('💡 Solo está disponible la API REST');
    }
    
    // 5. Verificar archivos estáticos
    console.log('\n5️⃣  VERIFICANDO ARCHIVOS ESTÁTICOS...');
    
    const fs = require('fs');
    const path = require('path');
    
    const staticPaths = [
        'public',
        'views',
        'frontend',
        'client',
        'web'
    ];
    
    let foundStaticFiles = false;
    
    for (const staticPath of staticPaths) {
        if (fs.existsSync(staticPath)) {
            console.log(`📁 Encontrado directorio: ${staticPath}`);
            const files = fs.readdirSync(staticPath);
            console.log(`   Archivos: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
            foundStaticFiles = true;
        }
    }
    
    if (!foundStaticFiles) {
        console.log('❌ No se encontraron directorios de archivos estáticos');
        console.log('💡 Este proyecto parece ser solo una API REST');
    }
    
    // 6. Verificar configuración del servidor
    console.log('\n6️⃣  VERIFICANDO CONFIGURACIÓN DEL SERVIDOR...');
    
    try {
        const serverFile = fs.readFileSync('server.js', 'utf8');
        
        if (serverFile.includes('express.static')) {
            console.log('✅ Servidor configurado para servir archivos estáticos');
        } else {
            console.log('❌ Servidor NO configurado para archivos estáticos');
            console.log('💡 Solo funciona como API REST');
        }
        
        if (serverFile.includes('app.get(\'/\'')) {
            console.log('✅ Ruta raíz (/) configurada');
        } else {
            console.log('❌ Ruta raíz (/) NO configurada');
            console.log('💡 No hay página de inicio web');
        }
        
    } catch (error) {
        console.log('❌ No se pudo leer server.js:', error.message);
    }
    
    // 7. Diagnóstico del problema
    console.log('\n7️⃣  DIAGNÓSTICO DEL PROBLEMA...');
    
    console.log('\n🎯 ANÁLISIS:');
    console.log('   📱 Celular: Funciona (tiene app móvil nativa)');
    console.log('   💻 Computadora: No funciona (falta interfaz web)');
    
    console.log('\n🚨 PROBLEMA IDENTIFICADO:');
    console.log('   ❌ No hay interfaz web para la computadora');
    console.log('   ❌ El servidor solo proporciona API REST');
    console.log('   ❌ Falta frontend web (HTML/CSS/JS)');
    
    console.log('\n💡 SOLUCIONES POSIBLES:');
    console.log('   1️⃣  Crear interfaz web simple');
    console.log('   2️⃣  Usar herramientas como Postman para probar API');
    console.log('   3️⃣  Crear formulario HTML básico');
    console.log('   4️⃣  Implementar frontend con React/Vue/Angular');
    
    // 8. Crear solución rápida
    console.log('\n8️⃣  CREANDO SOLUCIÓN RÁPIDA...');
    console.log('💡 Voy a crear una interfaz web simple para login');
    
    return true;
}

// Ejecutar diagnóstico
diagnosticarLoginComputadora().then(success => {
    if (success) {
        console.log('\n🔧 PREPARANDO SOLUCIÓN...');
        console.log('Se creará una interfaz web simple para que funcione en la computadora');
    }
}).catch(console.error); 