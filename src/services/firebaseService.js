import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { apiService } from './apiService';

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
    this.userId = null;
    this.userRole = null;
    this.messageListeners = [];
  }

  // Inicializar Firebase Cloud Messaging
  async initialize(user) {
    try {
      console.log('🔥 Inicializando Firebase Cloud Messaging...');
      console.log('👤 Usuario:', user ? { id: user.id, nombre: user.nombre, rol: user.rol } : 'undefined');
      
      if (!user) {
        console.log('⚠️ Usuario no definido, omitiendo inicialización');
        return { success: false, error: 'Usuario no definido' };
      }
      
      this.userId = user.id;
      this.userRole = user.rol;

      // Solicitar permisos
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('❌ Permisos de notificación denegados');
        return { success: false, error: 'Permisos denegados' };
      }

      // Obtener FCM token
      await this.getFCMToken();
      
      // Configurar listeners
      this.setupMessageListeners();
      
      // Configurar background message handler
      this.setupBackgroundMessageHandler();

      this.isInitialized = true;
      console.log('✅ Firebase Cloud Messaging inicializado correctamente');
      
      return {
        success: true,
        token: this.fcmToken,
        authStatus: authStatus
      };
      
    } catch (error) {
      console.error('❌ Error inicializando Firebase:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener token FCM
  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      
      console.log('🔑 FCM Token obtenido:', token);
      
      // Guardar token localmente
      await AsyncStorage.setItem('fcm_token', token);
      
      // Si es administrador, mostrar el token para configuración
      if (this.userRole === 'administrador') {
        console.log('');
        console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
        console.log('👑 ADMINISTRADOR - FCM TOKEN OBTENIDO:');
        console.log('🔑 TOKEN:', token);
        console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
        console.log('');
        
        setTimeout(() => {
          Alert.alert(
            '🔥 FIREBASE TOKEN DE ADMINISTRADOR',
            `¡IMPORTANTE! Copia este token FCM para configurar las notificaciones:\n\n${token.substring(0, 50)}...\n\nEste token debe agregarse al código para recibir notificaciones de empleados via Firebase.`,
            [
              { text: 'Ver Token Completo', onPress: () => this.showFullToken(token) },
              { text: 'Configurar Después', style: 'default' }
            ]
          );
        }, 1000);
      }
      
      // Enviar token al servidor
      try {
        await this.updateTokenOnServer(token);
      } catch (error) {
        console.log('⚠️ No se pudo actualizar token en servidor:', error.message);
      }
      
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo FCM token:', error);
      return null;
    }
  }

  // Mostrar token completo para configuración
  showFullToken(token) {
    Alert.alert(
      '🔑 TOKEN FCM COMPLETO',
      `Copia este token para configurar Firebase:\n\n${token}`,
      [
        { text: 'Cerrar', style: 'default' }
      ]
    );
  }

  // Actualizar token en el servidor
  async updateTokenOnServer(token) {
    try {
      const response = await apiService.makeRequest('/notifications/firebase-token', {
        method: 'PUT',
        body: JSON.stringify({ 
          fcmToken: token,
          userId: this.userId,
          userRole: this.userRole,
          platform: Platform.OS
        }),
      });
      console.log('✅ FCM Token actualizado en servidor');
      return response;
    } catch (error) {
      console.error('❌ Error actualizando FCM token en servidor:', error);
      throw error;
    }
  }

  // Configurar listeners de mensajes
  setupMessageListeners() {
    // Mensaje recibido cuando la app está en foreground
    const foregroundListener = messaging().onMessage(async remoteMessage => {
      console.log('📨 Mensaje FCM recibido (foreground):', remoteMessage);
      this.handleForegroundMessage(remoteMessage);
    });

    // Token actualizado (refrescar token)
    const tokenRefreshListener = messaging().onTokenRefresh(token => {
      console.log('🔄 FCM Token actualizado:', token);
      this.fcmToken = token;
      AsyncStorage.setItem('fcm_token', token);
      this.updateTokenOnServer(token).catch(console.error);
    });

    this.messageListeners = [foregroundListener, tokenRefreshListener];
  }

  // Configurar handler para mensajes en background
  setupBackgroundMessageHandler() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📨 Mensaje FCM recibido (background):', remoteMessage);
      // Aquí puedes manejar notificaciones en background si es necesario
    });
  }

  // Manejar mensaje en foreground
  handleForegroundMessage(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    if (notification) {
      // Mostrar alerta para feedback inmediato
      Alert.alert(
        notification.title || '🔔 Nueva Notificación',
        notification.body || 'Tienes una nueva notificación',
        [
          { text: 'Ver Detalles', onPress: () => this.handleNotificationAction(data) },
          { text: 'OK', style: 'default' }
        ]
      );
    }
  }

  // Manejar acción de notificación
  handleNotificationAction(data) {
    console.log('🎯 Acción de notificación:', data);
    
    if (data?.type === 'approval_request') {
      console.log('📋 Solicitud de aprobación recibida');
      // Aquí podrías navegar al panel de administrador
    }
  }

  // === FUNCIONES PARA ENVIAR NOTIFICACIONES ===

  // Enviar notificación a administradores usando Firebase
  async sendNotificationToAdmins(notificationData) {
    try {
      console.log('📤 Enviando notificación FCM a administradores...');
      
      // Obtener tokens de administradores almacenados
      const adminTokens = await this.getAdminTokens();
      
      if (adminTokens.length === 0) {
        console.log('⚠️ No hay tokens de administradores configurados para Firebase');
        return this.showAdminTokenAlert();
      }

      // Preparar payload para Firebase
      const payload = {
        tokens: adminTokens,
        title: notificationData.titulo || '🔔 Nueva Solicitud',
        body: notificationData.mensaje || 'Tienes una nueva solicitud pendiente',
        data: {
          type: 'admin_notification',
          module: notificationData.modulo || 'general',
          requires_approval: notificationData.requiere_aprobacion ? 'true' : 'false',
          timestamp: new Date().toISOString(),
          ...notificationData.datos_adicionales
        }
      };

      // Enviar via servidor (que usará Firebase Admin SDK)
      const response = await apiService.makeRequest('/notifications/firebase-send', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      console.log('✅ Notificación FCM enviada:', response);
      return { success: true, response };
      
    } catch (error) {
      console.error('❌ Error enviando notificación FCM:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener tokens de administradores
  async getAdminTokens() {
    try {
      // Intentar obtener desde el servidor
      const response = await apiService.makeRequest('/notifications/admin-tokens');
      return response.tokens || [];
    } catch (error) {
      console.log('⚠️ No se pudieron obtener tokens del servidor, usando configuración local');
      return this.getLocalAdminTokens();
    }
  }

  // Obtener tokens locales de administradores (fallback)
  getLocalAdminTokens() {
    // CONFIGURACIÓN LOCAL DE TOKENS FCM DE ADMINISTRADORES
    // ⚠️ IMPORTANTE: Agregar aquí los tokens FCM reales de los administradores
    const adminFCMTokens = [
      // 🔧 AGREGAR TOKENS FCM DE ADMINISTRADORES AQUÍ:
      // 'fcm_token_admin_1_aqui', // Nombre del admin 1
      // 'fcm_token_admin_2_aqui', // Nombre del admin 2
      
      // 📝 Ejemplo de token FCM:
      // 'dXLv4-example-token-12345:APA91bHsG_Example_Token_Firebase_FCM_Goes_Here'
    ];

    // Si no hay tokens configurados, usar el token actual como prueba
    if (adminFCMTokens.length === 0 && this.fcmToken) {
      console.log('🧪 Usando token actual como prueba para desarrollo');
      return [this.fcmToken];
    }

    return adminFCMTokens.filter(token => token && token.length > 10);
  }

  // Mostrar alerta de configuración de tokens
  showAdminTokenAlert() {
    Alert.alert(
      '⚠️ Configuración Firebase Requerida',
      'No hay tokens FCM de administradores configurados.\n\n1. Administrador debe hacer login\n2. Copiar su token FCM\n3. Agregarlo al código Firebase\n\nVer consola para el token.',
      [{ text: 'Entendido', style: 'default' }]
    );
    return { success: false, error: 'No admin tokens configured' };
  }

  // === FUNCIONES DE UTILIDAD ===

  // Obtener token actual
  getCurrentToken() {
    return this.fcmToken;
  }

  // Verificar si está inicializado
  isServiceInitialized() {
    return this.isInitialized;
  }

  // Limpiar listeners
  cleanup() {
    this.messageListeners.forEach(listener => {
      if (listener) listener();
    });
    this.messageListeners = [];
    console.log('🧹 Firebase listeners limpiados');
  }

  // Obtener estado del servicio
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      hasToken: !!this.fcmToken,
      userId: this.userId,
      userRole: this.userRole,
      listeners: this.messageListeners.length
    };
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService; 