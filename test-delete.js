// Script de prueba para la función de eliminación
const PostreIngrediente = require('./models/postreIngrediente');

async function testDelete() {
    try {
        console.log('=== PRUEBA DE FUNCIÓN DELETE ===\n');
        
        // 1. Obtener todos los registros
        console.log('1. Obteniendo todos los registros...');
        const registros = await PostreIngrediente.getAllPostresIngredientes();
        console.log('Registros encontrados:', registros);
        console.log(`Total de registros: ${registros.length}\n`);
        
        if (registros.length === 0) {
            console.log('No hay registros para eliminar. Creando uno de prueba...');
            
            // Crear un registro de prueba
            const nuevoId = await PostreIngrediente.createPostreIngrediente(1, 1, 100);
            console.log(`Registro de prueba creado con ID: ${nuevoId}\n`);
            
            // Obtener el registro recién creado
            const registroCreado = await PostreIngrediente.getPostreIngredienteById(nuevoId);
            console.log('Registro creado:', registroCreado);
            
            // Intentar eliminarlo
            console.log(`\n2. Intentando eliminar el registro con ID: ${nuevoId}`);
            const rowsAffected = await PostreIngrediente.deletePostreIngrediente(nuevoId);
            console.log(`Filas afectadas: ${rowsAffected}`);
            
            if (rowsAffected > 0) {
                console.log('✅ Eliminación exitosa!');
            } else {
                console.log('❌ No se eliminó ningún registro');
            }
            
        } else {
            // Usar el primer registro existente
            const primerRegistro = registros[0];
            console.log(`2. Intentando eliminar el registro:`, primerRegistro);
            
            const rowsAffected = await PostreIngrediente.deletePostreIngrediente(primerRegistro.id);
            console.log(`Filas afectadas: ${rowsAffected}`);
            
            if (rowsAffected > 0) {
                console.log('✅ Eliminación exitosa!');
                
                // Verificar que se eliminó
                const registroEliminado = await PostreIngrediente.getPostreIngredienteById(primerRegistro.id);
                if (!registroEliminado) {
                    console.log('✅ Confirmado: El registro ya no existe en la base de datos');
                } else {
                    console.log('❌ Error: El registro aún existe en la base de datos');
                }
            } else {
                console.log('❌ No se eliminó ningún registro');
            }
        }
        
        // 3. Verificar estado final
        console.log('\n3. Estado final de la tabla:');
        const registrosFinales = await PostreIngrediente.getAllPostresIngredientes();
        console.log('Registros restantes:', registrosFinales);
        console.log(`Total de registros: ${registrosFinales.length}`);
        
    } catch (error) {
        console.error('Error durante la prueba:', error);
    }
}

// Ejecutar la prueba
testDelete().then(() => {
    console.log('\n=== PRUEBA COMPLETADA ===');
    process.exit(0);
}).catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
}); 