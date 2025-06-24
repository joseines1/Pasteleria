#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍎 Iniciando proceso de build para iOS...\n');

// Verificar dependencias
console.log('1️⃣ Verificando dependencias...');
try {
  execSync('npx expo install --fix', { stdio: 'inherit' });
  console.log('✅ Dependencias verificadas\n');
} catch (error) {
  console.error('❌ Error al verificar dependencias:', error.message);
  process.exit(1);
}

// Verificar configuración de EAS
console.log('2️⃣ Verificando configuración de EAS...');
const easConfigPath = path.join(__dirname, 'eas.json');
if (!fs.existsSync(easConfigPath)) {
  console.error('❌ No se encontró eas.json');
  process.exit(1);
}
console.log('✅ Configuración de EAS encontrada\n');

// Verificar autenticación
console.log('3️⃣ Verificando autenticación con Expo...');
try {
  const whoami = execSync('npx eas whoami', { encoding: 'utf8' });
  console.log(`✅ Autenticado como: ${whoami.trim()}\n`);
} catch (error) {
  console.error('❌ No estás autenticado con Expo. Ejecuta: npx eas login');
  process.exit(1);
}

// Mostrar opciones de build
console.log('4️⃣ Opciones de build disponibles:');
console.log('   • development: Para desarrollo con simulador');
console.log('   • preview: Para testing en dispositivos físicos');
console.log('   • production: Para App Store\n');

// Función para ejecutar build
function buildIOS(profile = 'preview') {
  console.log(`🚀 Iniciando build de iOS con perfil: ${profile}`);
  
  const buildCommand = `npx eas build --platform ios --profile ${profile}`;
  
  try {
    execSync(buildCommand, { stdio: 'inherit' });
    console.log('\n✅ Build completado exitosamente!');
    
    // Mostrar cómo ver el build
    console.log('\n📱 Para descargar e instalar tu app:');
    console.log('1. Ve a: https://expo.dev/accounts/tu-usuario/projects/pasteleria-app/builds');
    console.log('2. Descarga el archivo .ipa');
    console.log('3. Instala con Xcode o herramientas de distribución\n');
    
  } catch (error) {
    console.error('\n❌ Error durante el build:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('• Verifica tu cuenta de Apple Developer');
    console.log('• Asegúrate de tener permisos de iOS Developer');
    console.log('• Intenta con perfil "development" primero');
    process.exit(1);
  }
}

// Ejecutar build
const profile = process.argv[2] || 'preview';
buildIOS(profile); 