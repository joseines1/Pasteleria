const db = require('../models/db');

async function addRoleColumn() {
  try {
    console.log('🔄 Agregando columna "rol" a la tabla usuarios...');

    // Agregar la columna rol con valor por defecto 'empleado'
    await db.execute(`
      ALTER TABLE usuarios 
      ADD COLUMN rol TEXT DEFAULT 'empleado'
    `);

    console.log('✅ Columna "rol" agregada exitosamente');

    // Opcional: Actualizar usuarios existentes si los hay
    const existingUsers = await db.execute('SELECT COUNT(*) as count FROM usuarios');
    const userCount = existingUsers.rows[0].count;

    if (userCount > 0) {
      console.log(`📋 Encontrados ${userCount} usuarios existentes`);
      
      // Actualizar usuarios existentes para que tengan rol 'empleado' por defecto
      await db.execute(`
        UPDATE usuarios 
        SET rol = 'empleado' 
        WHERE rol IS NULL OR rol = ''
      `);

      console.log('✅ Usuarios existentes actualizados con rol "empleado"');
    }

  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  La columna "rol" ya existe');
    } else {
      console.error('❌ Error agregando columna rol:', error);
      throw error;
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addRoleColumn().then(() => {
    console.log('\n✅ Migración completada');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  });
}

module.exports = addRoleColumn; 