const admin = require('firebase-admin');

// Configuración temporal de Firebase Admin (se debe reemplazar con credenciales reales)
const firebaseConfig = {
    type: "service_account",
    project_id: "pasteleria-app-demo",
    private_key_id: "demo-key-id",
    private_key: "-----BEGIN PRIVATE KEY-----\nDEMO_KEY_CONTENT\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-demo@pasteleria-app-demo.iam.gserviceaccount.com",
    client_id: "demo-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-demo%40pasteleria-app-demo.iam.gserviceaccount.com"
};

// Función para inicializar Firebase Admin
function initializeFirebase() {
    try {
        // Verificar si ya está inicializado
        if (admin.apps.length === 0) {
            // Para desarrollo, usaremos Expo Push Notifications como fallback
            console.log('🔥 Firebase configurado en modo desarrollo (usando Expo como fallback)');
            return true;
        }
        return true;
    } catch (error) {
        console.log('⚠️ Firebase no configurado, usando Expo Push Notifications como fallback');
        return false;
    }
}

// Función para enviar notificación via Firebase (con fallback a Expo)
async function sendPushNotification(tokens, title, body, data = {}) {
    try {
        console.log(`📤 Enviando notificación: "${title}" a ${tokens.length} dispositivos`);
        
        // Si Firebase está configurado, usar FCM
        if (admin.apps.length > 0) {
            const message = {
                notification: {
                    title: title,
                    body: body
                },
                data: {
                    ...data,
                    timestamp: new Date().toISOString()
                },
                tokens: tokens
            };

            const response = await admin.messaging().sendMulticast(message);
            console.log('✅ Notificaciones enviadas via Firebase:', response.successCount);
            return response;
        } else {
            // Fallback a Expo Push Notifications
            return await sendExpoNotification(tokens, title, body, data);
        }
    } catch (error) {
        console.error('❌ Error enviando notificación via Firebase:', error.message);
        // Intentar con Expo como fallback
        return await sendExpoNotification(tokens, title, body, data);
    }
}

// Función fallback usando Expo Push Notifications
async function sendExpoNotification(tokens, title, body, data = {}) {
    const axios = require('axios');
    
    try {
        console.log('📱 Usando Expo Push Notifications como fallback');
        
        const messages = tokens.map(token => ({
            to: token,
            title: title,
            body: body,
            data: {
                ...data,
                timestamp: new Date().toISOString()
            },
            sound: 'default',
            badge: 1,
            priority: 'high'
        }));

        const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, {
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Notificaciones enviadas via Expo:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error enviando notificación via Expo:', error.message);
        throw error;
    }
}

// Función para validar token de Firebase/Expo
function isValidPushToken(token) {
    if (!token) return false;
    
    // Validar formato de token Expo
    if (token.startsWith('ExponentPushToken[')) {
        return true;
    }
    
    // Validar formato de token Firebase (FCM)
    if (token.length > 50 && !token.includes('[')) {
        return true;
    }
    
    return false;
}

module.exports = {
    initializeFirebase,
    sendPushNotification,
    isValidPushToken,
    admin: admin.apps.length > 0 ? admin : null
}; 