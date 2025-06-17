const PushNotificationService = require('./services/pushNotificationService');

async function testCRUDNotifications() {
    console.log('🧪 Probando Sistema de Notificaciones CRUD\n');

    try {
        // Simular creación de ingrediente
        console.log('1️⃣ Simulando: Empleado crea ingrediente...');
        await PushNotificationService.notifyIngredienteCreated(
            { id: 1, nombre: 'Chocolate Premium' },
            'Juan Pérez'
        );
        console.log('   ✅ Notificación de creación enviada\n');

        // Esperar un poco entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular actualización de postre
        console.log('2️⃣ Simulando: Empleado actualiza postre...');
        await PushNotificationService.notifyPostreUpdated(
            { id: 2, nombre: 'Torta de Chocolate' },
            'María García'
        );
        console.log('   ✅ Notificación de actualización enviada\n');

        // Esperar un poco entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular eliminación de receta
        console.log('3️⃣ Simulando: Empleado elimina receta...');
        await PushNotificationService.notifyRecetaDeleted(
            { postre_nombre: 'Brownie de Nuez' },
            'Carlos López'
        );
        console.log('   ✅ Notificación de eliminación enviada\n');

        // Esperar un poco entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular creación de postre
        console.log('4️⃣ Simulando: Empleado crea nuevo postre...');
        await PushNotificationService.notifyPostreCreated(
            { id: 3, nombre: 'Cheesecake de Fresa' },
            'Ana Martínez'
        );
        console.log('   ✅ Notificación de creación enviada\n');

        // Esperar un poco entre notificaciones
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular eliminación de ingrediente
        console.log('5️⃣ Simulando: Empleado elimina ingrediente...');
        await PushNotificationService.notifyIngredienteDeleted(
            'Azúcar Refinada',
            'Pedro Rodríguez'
        );
        console.log('   ✅ Notificación de eliminación enviada\n');

        console.log('🎉 ¡Prueba completada exitosamente!');
        console.log('\n📱 Los administradores deberían haber recibido 5 notificaciones:');
        console.log('   1. 📦 Nuevo ingrediente: Chocolate Premium (Juan)');
        console.log('   2. 🍰 Postre actualizado: Torta de Chocolate (María)');
        console.log('   3. 🔗 Receta eliminada: Brownie de Nuez (Carlos)');
        console.log('   4. 🍰 Nuevo postre: Cheesecake de Fresa (Ana)');
        console.log('   5. 📦 Ingrediente eliminado: Azúcar Refinada (Pedro)');

        console.log('\n💡 Estas notificaciones se envían automáticamente cuando:');
        console.log('   • Un empleado realiza operaciones CRUD desde la app móvil');
        console.log('   • Las operaciones se completan exitosamente');
        console.log('   • El sistema tiene tokens push válidos registrados');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    }
}

// Ejecutar la prueba
console.log('🚀 Iniciando prueba del sistema de notificaciones CRUD...\n');
testCRUDNotifications(); 