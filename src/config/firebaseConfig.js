// Configuración Firebase para React Native
// Esta configuración permite que la app se conecte con Firebase

const firebaseConfig = {
  // CONFIGURACIÓN DE FIREBASE PARA REACT NATIVE
  // ⚠️ IMPORTANTE: Reemplazar con credenciales reales de Firebase
  
  // Configuración temporal para desarrollo - REEMPLAZAR con datos reales del GoogleService-Info.plist
  apiKey: "YOUR_IOS_API_KEY_FROM_GOOGLESERVICE_INFO_PLIST",
  authDomain: "pasteleria-app-ba6b6.firebaseapp.com", // Reemplazar con tu domain
  projectId: "pasteleria-app-ba6b6", // Tu project ID que veo en la captura
  storageBucket: "pasteleria-app-ba6b6.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID", // Del archivo GoogleService-Info.plist
  appId: "YOUR_IOS_APP_ID", // Del archivo GoogleService-Info.plist
  
  // Configuración específica para notificaciones
  vapidKey: "demo-vapid-key-for-web-notifications"
};

// Instrucciones para obtener la configuración real:
// 1. Ve a Firebase Console -> Project Settings -> General
// 2. Busca tu app iOS y descarga GoogleService-Info.plist
// 3. Abre el archivo .plist y copia estos valores:
//    - API_KEY -> apiKey
//    - GCM_SENDER_ID -> messagingSenderId  
//    - GOOGLE_APP_ID -> appId
//    - PROJECT_ID -> projectId
// 4. Reemplaza los valores de arriba con los reales

// Configuración específica para cada plataforma
const platformConfig = {
  android: {
    // Configuración específica de Android
    googleServicesFile: 'google-services.json',
    notificationIcon: 'notification_icon',
    notificationColor: '#3498db',
    defaultChannel: 'default'
  },
  ios: {
    // Configuración específica de iOS  
    googleServicesFile: 'GoogleService-Info.plist', // Archivo descargado de Firebase Console
    pushCertificate: 'production', // 'production' o 'development'
    bundleId: 'com.pasteleria.app' // Debe coincidir con app.json
  }
};

// Instrucciones de configuración paso a paso
const setupInstructions = {
  step1: 'Ir a Firebase Console (https://console.firebase.google.com)',
  step2: 'Seleccionar proyecto "pasteleria app"', 
  step3: 'Agregar aplicación iOS con Bundle ID: com.pasteleria.app',
  step4: 'Descargar GoogleService-Info.plist',
  step5: 'Colocar GoogleService-Info.plist en la raíz del proyecto',
  step6: 'Actualizar firebaseConfig con credenciales reales del .plist',
  step7: 'Habilitar Cloud Messaging en Firebase Console',
  step8: 'Para Expo: usar expo-notifications en lugar de @react-native-firebase'
};

export { firebaseConfig, platformConfig, setupInstructions };
export default firebaseConfig; 