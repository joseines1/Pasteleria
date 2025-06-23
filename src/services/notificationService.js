import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.isInitialized = false;
    this.userId = null;
    this.userName = null;
    this.userRole = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize(user) {
    try {
      console.log('🔔 Inicializando sistema de notificaciones...');
      console.log('👤 Usuario:', user ? { id: user.id, nombre: user.nombre, rol: user.rol } : 'undefined');
      
      if (!user || !user.nombre) {
        console.log('⚠️ Usuario no válido, usando notificaciones locales solamente');
        this.isInitialized = true;
        return { success: true, mode: 'local-only' };
      }

      this.userId = user.id;
      this.userName = user.nombre;
      this.userRole = user.rol;

      // Configurar notificaciones locales
      await this.setupLocalNotifications();

      // Intentar configurar push notifications
      if (Device.isDevice) {
        try {
          await this.setupPushNotifications();
        } catch (error) {
          console.log('⚠️ Push notifications no disponibles, usando solo locales:', error.message);
        }
      } else {
        console.log('📱 Simulador detectado - solo notificaciones locales');
      }

      // Configurar listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ Sistema de notificaciones inicializado');
      
      return { 
        success: true, 
        pushToken: this.expoPushToken,
        mode: this.expoPushToken ? 'push-enabled' : 'local-only'
      };

    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
      this.isInitialized = true; // Permitir notificaciones locales
      return { success: false, error: error.message, mode: 'local-only' };
    }
  }

  async setupLocalNotifications() {
    try {
      // Solicitar permisos para notificaciones locales
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('⚠️ Permisos de notificación denegados');
        return false;
      }

      console.log('✅ Permisos de notificación concedidos');
      return true;
    } catch (error) {
      console.error('❌ Error configurando notificaciones locales:', error);
      return false;
    }
  }

  async setupPushNotifications() {
    try {
      // Obtener token de Expo Push Notifications
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      console.log('🔑 Expo Push Token obtenido:', token);
      
      // Guardar token localmente
      await AsyncStorage.setItem('expo_push_token', token);
      
      // Intentar enviar token al servidor
      try {
        await this.updatePushTokenOnServer(token);
        console.log('✅ Push token actualizado en servidor');
      } catch (error) {
        console.log('⚠️ No se pudo actualizar token en servidor:', error.message);
      }
      
      return token;
    } catch (error) {
      console.error('❌ Error configurando push notifications:', error);
      throw error;
    }
  }

  async updatePushTokenOnServer(token) {
    try {
      // Intentar usar endpoint genérico de usuario si existe
      await apiService.makeRequest('/auth/update-push-token', {
        method: 'PUT',
        body: JSON.stringify({
          expoPushToken: token,
          userId: this.userId,
          userName: this.userName,
          userRole: this.userRole,
          platform: Platform.OS
        }),
      });
      console.log('✅ Push token actualizado en servidor');
    } catch (error) {
      // Si el endpoint no existe (404), no es un error crítico
      if (error.message.includes('404')) {
        console.log('ℹ️ Endpoint de push token no disponible en servidor (continuando sin él)');
        return; // No lanzar error, continuar sin actualizar en servidor
      }
      
      console.error('❌ Error actualizando push token en servidor:', error);
      // No lanzar error para permitir que las notificaciones locales funcionen
      console.log('⚠️ Continuando con notificaciones locales solamente');
    }
  }

  setupNotificationListeners() {
    // Listener para notificaciones recibidas
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Notificación recibida:', notification);
    });

    // Listener para cuando el usuario toca una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notificación tocada:', response);
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationResponse(response) {
    const data = response.notification.request.content.data;
    console.log('🎯 Procesando respuesta de notificación:', data);
    
    if (data?.module) {
      console.log(`📋 Módulo: ${data.module}`);
      // Aquí podrías navegar a pantallas específicas según el módulo
    }
  }

  // === FUNCIONES PARA ENVIAR NOTIFICACIONES ===

  async sendLocalNotification(title, body, data = {}) {
    try {
      console.log('📱 Enviando notificación local:', { title, body });
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: 'default',
        },
        trigger: null, // Mostrar inmediatamente
      });
      
      console.log('✅ Notificación local enviada');
      return { success: true, type: 'local' };
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
      return { success: false, error: error.message };
    }
  }

  async sendCustomNotification(notificationData) {
    try {
      console.log('📤 Enviando notificación personalizada:', notificationData);
      
      // Enviar notificación local inmediata
      await this.sendLocalNotification(
        notificationData.title || '🔔 Nueva Notificación',
        notificationData.message || 'Tienes una nueva notificación',
        notificationData.data || {}
      );

      // Intentar enviar al servidor para persistencia
      try {
        const response = await apiService.makeRequest('/notifications', {
          method: 'POST',
          body: JSON.stringify({
            titulo: notificationData.title,
            mensaje: notificationData.message,
            modulo: notificationData.module || 'general',
            usuario_emisor: this.userName || 'Sistema',
            rol_emisor: this.userRole || 'usuario',
            datos_adicionales: notificationData.data || {},
            requiere_aprobacion: notificationData.requiresApproval || false
          })
        });
        console.log('✅ Notificación guardada en servidor:', response);
      } catch (serverError) {
        console.log('⚠️ Error guardando en servidor (continúa con local):', serverError.message);
      }

      return { success: true, type: 'custom' };
    } catch (error) {
      console.error('❌ Error enviando notificación personalizada:', error);
      return { success: false, error: error.message };
    }
  }

  // Funciones específicas para diferentes tipos de notificaciones
  async notifyRecipeCreated(recipeData) {
    return await this.sendCustomNotification({
      title: '🧁 Nueva Receta Creada',
      message: `Se ha creado una nueva receta: ${recipeData.postreNombre} con ${recipeData.ingredienteNombre}`,
      module: 'recetas',
      data: {
        action: 'recipe_created',
        recipe: recipeData
      }
    });
  }

  async notifyDeletion(tipo, nombre) {
    return await this.sendCustomNotification({
      title: `🗑️ ${tipo} Eliminado`,
      message: `Se ha eliminado: ${nombre}`,
      module: tipo.toLowerCase(),
      data: {
        action: 'item_deleted',
        itemType: tipo,
        itemName: nombre
      }
    });
  }

  async notifyApprovalRequest(requestData) {
    return await this.sendCustomNotification({
      title: '📋 Solicitud de Aprobación',
      message: `${requestData.usuario} solicita: ${requestData.accion}`,
      module: requestData.modulo || 'general',
      data: {
        action: 'approval_request',
        ...requestData
      },
      requiresApproval: true
    });
  }

  // === FUNCIONES DE UTILIDAD ===

  getCurrentPushToken() {
    return this.expoPushToken;
  }

  isServiceInitialized() {
    return this.isInitialized;
  }

  async cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    
    this.isInitialized = false;
    this.expoPushToken = null;
    this.userId = null;
    this.userName = null;
    this.userRole = null;
  }

  getServiceStatus() {
    return {
      initialized: this.isInitialized,
      pushToken: this.expoPushToken,
      userId: this.userId,
      userName: this.userName,
      userRole: this.userRole
    };
  }
}

// Crear instancia única del servicio
const notificationService = new NotificationService();

export { notificationService };
export default notificationService; 