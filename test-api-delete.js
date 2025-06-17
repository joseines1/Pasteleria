// Script para probar eliminaciones a través de la API
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Función para hacer login y obtener token
async function login() {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'admin123'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error en login:', error.message);
        return null;
    }
}

// Función para probar eliminación de ingrediente
async function testDeleteIngrediente(token, id) {
    try {
        console.log(`\n🧪 Probando eliminación de ingrediente ID: ${id}`);
        
        const response = await fetch(`${BASE_URL}/ingredientes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Respuesta:', data);
        
        return response.ok;
    } catch (error) {
        console.error('Error eliminando ingrediente:', error.message);
        return false;
    }
}

// Función para probar eliminación de postre
async function testDeletePostre(token, id) {
    try {
        console.log(`\n🍰 Probando eliminación de postre ID: ${id}`);
        
        const response = await fetch(`${BASE_URL}/postres/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Respuesta:', data);
        
        return response.ok;
    } catch (error) {
        console.error('Error eliminando postre:', error.message);
        return false;
    }
}

// Función para probar eliminación de relación postre-ingrediente
async function testDeletePostreIngrediente(token, id) {
    try {
        console.log(`\n🔗 Probando eliminación de postre-ingrediente ID: ${id}`);
        
        const response = await fetch(`${BASE_URL}/postres-ingredientes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Respuesta:', data);
        
        return response.ok;
    } catch (error) {
        console.error('Error eliminando postre-ingrediente:', error.message);
        return false;
    }
}

// Función para obtener todos los registros
async function getAllRecords(token) {
    try {
        console.log('\n📋 Obteniendo todos los registros...');
        
        // Ingredientes
        const ingredientesResponse = await fetch(`${BASE_URL}/ingredientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const ingredientes = await ingredientesResponse.json();
        console.log(`Ingredientes disponibles: ${ingredientes.length}`);
        if (ingredientes.length > 0) {
            console.log('Primer ingrediente:', ingredientes[0]);
        }
        
        // Postres
        const postresResponse = await fetch(`${BASE_URL}/postres`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const postres = await postresResponse.json();
        console.log(`Postres disponibles: ${postres.length}`);
        if (postres.length > 0) {
            console.log('Primer postre:', postres[0]);
        }
        
        // Postres-Ingredientes
        const relacionesResponse = await fetch(`${BASE_URL}/postres-ingredientes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const relaciones = await relacionesResponse.json();
        console.log(`Relaciones disponibles: ${relaciones.length}`);
        if (relaciones.length > 0) {
            console.log('Primera relación:', relaciones[0]);
        }
        
        return { ingredientes, postres, relaciones };
    } catch (error) {
        console.error('Error obteniendo registros:', error.message);
        return null;
    }
}

// Función principal
async function testApiDeletes() {
    console.log('=== PRUEBA DE ELIMINACIONES VÍA API ===\n');
    
    try {
        // 1. Login
        console.log('🔐 Intentando hacer login...');
        const token = await login();
        
        if (!token) {
            console.log('❌ No se pudo obtener token. Creando usuario admin...');
            
            // Intentar crear usuario admin
            try {
                const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: 'Admin',
                        email: 'admin@test.com',
                        password: 'admin123'
                    })
                });
                
                if (registerResponse.ok) {
                    console.log('✅ Usuario admin creado');
                    const newToken = await login();
                    if (newToken) {
                        console.log('✅ Login exitoso con nuevo usuario');
                        return await testApiDeletes(); // Reintentar
                    }
                }
            } catch (error) {
                console.error('Error creando usuario:', error.message);
            }
            
            console.log('❌ No se puede continuar sin autenticación');
            return;
        }
        
        console.log('✅ Login exitoso');
        
        // 2. Obtener registros existentes
        const records = await getAllRecords(token);
        if (!records) {
            console.log('❌ No se pudieron obtener los registros');
            return;
        }
        
        // 3. Probar eliminaciones
        if (records.ingredientes.length > 0) {
            const ingredienteId = records.ingredientes[0].idIngrediente;
            await testDeleteIngrediente(token, ingredienteId);
        } else {
            console.log('⚠️ No hay ingredientes para eliminar');
        }
        
        if (records.postres.length > 0) {
            const postreId = records.postres[0].idPostre;
            await testDeletePostre(token, postreId);
        } else {
            console.log('⚠️ No hay postres para eliminar');
        }
        
        if (records.relaciones.length > 0) {
            const relacionId = records.relaciones[0].id;
            await testDeletePostreIngrediente(token, relacionId);
        } else {
            console.log('⚠️ No hay relaciones para eliminar');
        }
        
        // 4. Verificar estado final
        console.log('\n📊 Estado final:');
        await getAllRecords(token);
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar las pruebas
testApiDeletes().then(() => {
    console.log('\n🏁 Pruebas de API completadas');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
}); 