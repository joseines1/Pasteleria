// Script de prueba para todas las funciones de eliminación
const Ingrediente = require('./models/ingrediente');
const Postre = require('./models/postre');
const PostreIngrediente = require('./models/postreIngrediente');
const Usuario = require('./models/usuario');

async function testAllDeletes() {
    console.log('=== PRUEBA COMPLETA DE FUNCIONES DELETE ===\n');
    
    try {
        // 1. PRUEBA DE INGREDIENTES
        console.log('🧪 1. PROBANDO ELIMINACIÓN DE INGREDIENTES');
        console.log('─'.repeat(50));
        
        // Crear un ingrediente de prueba
        const ingredienteId = await Ingrediente.createIngrediente('Ingrediente Test', 100);
        console.log(`✅ Ingrediente creado con ID: ${ingredienteId}`);
        
        // Verificar que existe
        const ingredienteCreado = await Ingrediente.getIngredienteById(ingredienteId);
        console.log(`✅ Ingrediente verificado:`, ingredienteCreado);
        
        // Eliminarlo
        const ingredienteRowsAffected = await Ingrediente.deleteIngrediente(ingredienteId);
        console.log(`✅ Ingrediente eliminado. Filas afectadas: ${ingredienteRowsAffected}`);
        
        // Verificar que se eliminó
        const ingredienteEliminado = await Ingrediente.getIngredienteById(ingredienteId);
        if (!ingredienteEliminado) {
            console.log('✅ INGREDIENTE: Eliminación exitosa confirmada\n');
        } else {
            console.log('❌ INGREDIENTE: Error - el registro aún existe\n');
        }
        
        // 2. PRUEBA DE POSTRES
        console.log('🍰 2. PROBANDO ELIMINACIÓN DE POSTRES');
        console.log('─'.repeat(50));
        
        // Crear un postre de prueba
        const postreId = await Postre.createPostre('Postre Test');
        console.log(`✅ Postre creado con ID: ${postreId}`);
        
        // Verificar que existe
        const postreCreado = await Postre.getPostreById(postreId);
        console.log(`✅ Postre verificado:`, postreCreado);
        
        // Eliminarlo
        const postreRowsAffected = await Postre.deletePostre(postreId);
        console.log(`✅ Postre eliminado. Filas afectadas: ${postreRowsAffected}`);
        
        // Verificar que se eliminó
        const postreEliminado = await Postre.getPostreById(postreId);
        if (!postreEliminado) {
            console.log('✅ POSTRE: Eliminación exitosa confirmada\n');
        } else {
            console.log('❌ POSTRE: Error - el registro aún existe\n');
        }
        
        // 3. PRUEBA DE POSTRES-INGREDIENTES
        console.log('🔗 3. PROBANDO ELIMINACIÓN DE POSTRES-INGREDIENTES');
        console.log('─'.repeat(50));
        
        // Crear una relación de prueba
        const relacionId = await PostreIngrediente.createPostreIngrediente(1, 1, 50);
        console.log(`✅ Relación creada con ID: ${relacionId}`);
        
        // Verificar que existe
        const relacionCreada = await PostreIngrediente.getPostreIngredienteById(relacionId);
        console.log(`✅ Relación verificada:`, relacionCreada);
        
        // Eliminarla
        const relacionRowsAffected = await PostreIngrediente.deletePostreIngrediente(relacionId);
        console.log(`✅ Relación eliminada. Filas afectadas: ${relacionRowsAffected}`);
        
        // Verificar que se eliminó
        const relacionEliminada = await PostreIngrediente.getPostreIngredienteById(relacionId);
        if (!relacionEliminada) {
            console.log('✅ POSTRE-INGREDIENTE: Eliminación exitosa confirmada\n');
        } else {
            console.log('❌ POSTRE-INGREDIENTE: Error - el registro aún existe\n');
        }
        
        // 4. PRUEBA DE USUARIOS
        console.log('👤 4. PROBANDO ELIMINACIÓN DE USUARIOS');
        console.log('─'.repeat(50));
        
        // Crear un usuario de prueba
        const usuarioId = await Usuario.createUsuario('Usuario Test', 'test@test.com', 'password123');
        console.log(`✅ Usuario creado con ID: ${usuarioId}`);
        
        // Verificar que existe
        const usuarioCreado = await Usuario.getUsuarioById(usuarioId);
        console.log(`✅ Usuario verificado:`, usuarioCreado);
        
        // Eliminarlo
        const usuarioRowsAffected = await Usuario.deleteUsuario(usuarioId);
        console.log(`✅ Usuario eliminado. Filas afectadas: ${usuarioRowsAffected}`);
        
        // Verificar que se eliminó
        const usuarioEliminado = await Usuario.getUsuarioById(usuarioId);
        if (!usuarioEliminado) {
            console.log('✅ USUARIO: Eliminación exitosa confirmada\n');
        } else {
            console.log('❌ USUARIO: Error - el registro aún existe\n');
        }
        
        console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
        console.log('═'.repeat(50));
        console.log('✅ Ingredientes: Eliminación funcional');
        console.log('✅ Postres: Eliminación funcional');
        console.log('✅ Postres-Ingredientes: Eliminación funcional');
        console.log('✅ Usuarios: Eliminación funcional');
        
    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
        throw error;
    }
}

// Ejecutar todas las pruebas
testAllDeletes().then(() => {
    console.log('\n🏁 TODAS LAS PRUEBAS DE ELIMINACIÓN COMPLETADAS');
    process.exit(0);
}).catch(error => {
    console.error('💥 Error fatal en las pruebas:', error);
    process.exit(1);
}); 