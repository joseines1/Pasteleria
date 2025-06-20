// Script para generar comandos de configuración de Heroku
const { execSync } = require('child_process');

console.log('🚀 Generando comandos para configurar Heroku...\n');

const APP_NAME = 'pasteleria-c6865951d4d7';

const commands = [
    `heroku config:set NODE_ENV=production --app ${APP_NAME}`,
    `heroku config:set JWT_SECRET=clave_super_segura_produccion_pasteleria_2024_12345 --app ${APP_NAME}`,
    `heroku config:set TURSO_DATABASE_URL=libsql://pasteleria-ines.aws-us-east-1.turso.io --app ${APP_NAME}`,
    `heroku config:set TURSO_SECRET_KEY="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDk4NjE3MDYsImlkIjoiMjVhYTJmODYtMGM4ZS00NzkyLTk4YzUtNjgzZGNhZjQ4NjY0IiwicmlkIjoiZjBmNGMxMmYtNTVkNC00MjI0LWI0MjEtNTU2Yjg1MmE2OGY0In0.gSxB3KPTbhdA1Qh8iWvR6ssRmcmT7DyVQo3vVNBuUk0YxQfIu2DWWV9LDr63DG3supNZtC4vBmTre3ELcaRVBg" --app ${APP_NAME}`,
    `heroku config:set CORS_ORIGIN=https://${APP_NAME}.herokuapp.com --app ${APP_NAME}`
];

console.log('📋 Ejecuta estos comandos en tu terminal:\n');

commands.forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd}`);
});

console.log('\n🔄 Después de configurar las variables, ejecuta:\n');
console.log(`6. heroku run node init-database.js --app ${APP_NAME}`);
console.log(`7. heroku restart --app ${APP_NAME}`);
console.log(`8. heroku logs --tail --app ${APP_NAME}`);

console.log('\n🧪 Para probar la API:\n');
console.log(`9. curl https://${APP_NAME}.herokuapp.com/health`);
console.log(`10. curl https://${APP_NAME}.herokuapp.com/postres`);
console.log(`11. curl https://${APP_NAME}.herokuapp.com/ingredientes`);

console.log('\n✅ Tu API estará lista en: https://' + APP_NAME + '.herokuapp.com');

// Opcional: Ejecutar automáticamente si se pasa --execute
if (process.argv.includes('--execute')) {
    console.log('\n🔄 Ejecutando comandos automáticamente...\n');
    
    try {
        commands.forEach((cmd, index) => {
            console.log(`Ejecutando ${index + 1}/${commands.length}: ${cmd}`);
            execSync(cmd, { stdio: 'inherit' });
        });
        
        console.log('\n✅ Variables de entorno configuradas exitosamente!');
        console.log('\n🔄 Inicializando base de datos...');
        execSync(`heroku run node init-database.js --app ${APP_NAME}`, { stdio: 'inherit' });
        
        console.log('\n🔄 Reiniciando aplicación...');
        execSync(`heroku restart --app ${APP_NAME}`, { stdio: 'inherit' });
        
        console.log('\n🎉 ¡Configuración completada! Tu API debería estar funcionando.');
        
    } catch (error) {
        console.error('❌ Error ejecutando comandos:', error.message);
        console.log('\n💡 Ejecuta los comandos manualmente uno por uno.');
    }
} 