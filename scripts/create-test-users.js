const Usuario = require('../models/usuario');

async function createTestUsers() {
  try {
    console.log('🔄 Creando usuarios de prueba...');

    // Verificar si ya existen
    const adminExists = await Usuario.getUsuarioByEmail('admin@test.com');
    const employeeExists = await Usuario.getUsuarioByEmail('empleado@test.com');

    if (!adminExists) {
      // Crear usuario administrador
      const adminId = await Usuario.createUsuario(
        'Administrador', 
        'admin@test.com', 
        'admin123',
        'administrador'
      );
      console.log('✅ Usuario administrador creado con ID:', adminId);
    } else {
      console.log('ℹ️  Usuario administrador ya existe');
    }

    if (!employeeExists) {
      // Crear usuario empleado
      const employeeId = await Usuario.createUsuario(
        'Empleado Test', 
        'empleado@test.com', 
        'emp123',
        'empleado'
      );
      console.log('✅ Usuario empleado creado con ID:', employeeId);
    } else {
      console.log('ℹ️  Usuario empleado ya existe');
    }

    console.log('\n📋 Credenciales de prueba:');
    console.log('👑 Admin: admin@test.com / admin123');
    console.log('👷 Empleado: empleado@test.com / emp123');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTestUsers().then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

module.exports = createTestUsers; 