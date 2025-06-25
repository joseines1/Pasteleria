import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import Constants from 'expo-constants';

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
      // Guardar información del usuario
      this.userId = user?.id;
      this.userName = user?.nombre;
      this.userRole = user?.rol;
      
      // Configurar notificaciones locales
      await this.setupLocalNotifications();
      
      // Configurar push notifications si estamos en un dispositivo físico
      if (Device.isDevice) {
        await this.setupPushNotifications();
      } else {
        // Solo notificaciones locales para simuladores
      }
      
      // Configurar listeners
      this.setupNotificationListeners();
      
      this.initialized = true;
      return { success: true };
    } catch (error) {
      console.error('❌ Error inicializando servicio de notificaciones:', error);
      // Continuar sin notificaciones push
      this.initialized = true;
      return { success: false, error: error.message };
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
      if (Platform.OS === 'ios') {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          return;
        }
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId
      });
      
      this.expoPushToken = token.data;
      
      // Actualizar token en el servidor si tenemos usuario
      if (this.userId) {
        await this.updatePushTokenOnServer(token.data);
      }
      
      return token.data;
    } catch (error) {
      console.error('❌ Error configurando push notifications:', error);
      return null;
    }
  }

  async updatePushTokenOnServer(token) {
    try {
      if (!token || !this.userId) {
        return { success: false, error: 'Token o usuario no disponible' };
      }

      const response = await apiService.makeRequest('/api/usuarios/push-token', {
        method: 'POST',
        body: JSON.stringify({
          userId: this.userId,
          pushToken: token
        })
      });

      return { success: true, response };
    } catch (error) {
      console.error('❌ Error actualizando push token:', error);
      return { success: false, error: error.message };
    }
  }

  setupNotificationListeners() {
    // Listener para notificaciones recibidas cuando la app está en primer plano
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      this.handleNotificationResponse({ notification });
    });

    // Listener para cuando el usuario toca una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationResponse(response) {
    const data = response.notification.request.content.data;
    
    if (data?.module) {
      // Manejar navegación basada en el módulo de la notificación
    }
  }

  // === MÉTODOS ADICIONALES ===

  async updateTokenAfterLogin(user, authToken) {
    try {
      this.userId = user.id;
      this.userName = user.nombre;
      this.userRole = user.rol;
      
      // Configurar token de auth en apiService
      apiService.setAuthToken(authToken);
      
      // Si ya tenemos un push token, actualizarlo en el servidor
      if (this.expoPushToken) {
        await this.updatePushTokenOnServer(this.expoPushToken);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error en configuración post-login:', error);
      return { success: false, error: error.message };
    }
  }

  // === FUNCIONES PARA ENVIAR NOTIFICACIONES ===

  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data,
          sound: 'default',
        },
        trigger: null, // Mostrar inmediatamente
      });
      
      return { success: true, type: 'local' };
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
      return { success: false, error: error.message };
    }
  }

  async sendCustomNotification(notificationData) {
    try {
      // Enviar notificación local inmediata
      await this.sendLocalNotification(
        notificationData.title || notificationData.titulo || '🔔 Nueva Notificación',
        notificationData.message || notificationData.mensaje || 'Tienes una nueva notificación',
        notificationData.data || {}
      );

      // Intentar enviar al servidor para persistencia
      try {
        const response = await apiService.makeRequest('/api/notifications/custom', {
          method: 'POST',
          body: JSON.stringify({
            titulo: notificationData.title || notificationData.titulo,
            mensaje: notificationData.message || notificationData.mensaje,
            modulo: notificationData.module || notificationData.modulo || 'general',
            datos_extra: notificationData.data || {}
          })
        });
      } catch (serverError) {
        // Continuar con notificación local
      }

      return { success: true, type: 'custom' };
    } catch (error) {
      console.error('❌ Error enviando notificación personalizada:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTestNotification() {
    try {
      console.log('🧪 Enviando notificación de prueba...');
      
      const testTitle = '🧪 Prueba de Notificaciones';
      const testMessage = `¡Prueba exitosa! Sistema funcionando correctamente.\n\nUsuario: ${this.userName || 'Anónimo'}\nTiempo: ${new Date().toLocaleTimeString()}`;
      
      // Determinar el modo de operación
      const status = this.getServiceStatus();
      const mode = this.expoPushToken ? 'push-enabled' : 'local-only';
      
      // Enviar notificación local (siempre funciona)
      const localResult = await this.sendLocalNotification(
        testTitle,
        testMessage,
        {
          test: true,
          timestamp: Date.now(),
          mode: mode,
          userId: this.userId,
          pushToken: this.expoPushToken ? 'habilitado' : 'no disponible'
        }
      );

      if (!localResult.success) {
        throw new Error('Error enviando notificación local: ' + localResult.error);
      }

      // Intentar enviar push notification si está disponible
      if (this.expoPushToken) {
        try {
          console.log('📡 Intentando enviar push notification...');
          const response = await apiService.makeRequest('/api/notifications/test-push', {
            method: 'POST',
            body: JSON.stringify({
              expoPushToken: this.expoPushToken,
              title: testTitle,
              message: testMessage,
              data: { test: true, mode: 'push' }
            })
          });
          console.log('✅ Push notification enviada:', response);
        } catch (pushError) {
          console.log('⚠️ Push notification no disponible (usando solo local):', pushError.message);
        }
      }

      console.log('✅ Notificación de prueba enviada exitosamente');
      
      return {
        success: true,
        mode: mode,
        message: 'Notificación de prueba enviada correctamente',
        details: {
          local: true,
          push: !!this.expoPushToken,
          user: this.userName,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Error en notificación de prueba:', error);
      return {
        success: false,
        error: error.message,
        mode: 'error'
      };
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
    try {
      console.log('📤 Enviando solicitud de aprobación a administradores...', requestData);
      
      // Enviar notificación local primero
      const localResult = await this.sendCustomNotification({
        title: '📋 Solicitud de Aprobación',
        message: `${requestData.usuario} solicita: ${requestData.accion}`,
        module: requestData.modulo || 'general',
        data: {
          action: 'approval_request',
          ...requestData
        },
        requiresApproval: true
      });

      // Guardar la solicitud localmente para el administrador
      await this.savePendingApprovalRequest({
        titulo: '📋 Solicitud de Aprobación',
        mensaje: `${requestData.usuario} solicita: ${requestData.accion}`,
        modulo: requestData.modulo || 'general',
        usuario_solicitante: requestData.usuario,
        approval_data: requestData,
        action_type: requestData.action_type || 'general_approval'
      });

      // Intentar enviar al servidor para que llegue a otros administradores
      try {
        console.log('🌐 Enviando solicitud al servidor para otros administradores...');
        
        const serverResult = await apiService.makeRequest('/api/notifications/approval-request', {
          method: 'POST',
          body: JSON.stringify({
            titulo: '📋 Nueva Solicitud de Aprobación',
            mensaje: `${requestData.usuario} solicita: ${requestData.accion}`,
            modulo: requestData.modulo || 'general',
            tipo: 'solicitud',
            usuario_solicitante_nombre: requestData.usuario,
            requiere_aprobacion: true,
            datos_adicionales: requestData,
            target_role: 'administrador'
          })
        });
        
        console.log('✅ Solicitud enviada al servidor:', serverResult);
        
        return {
          success: true,
          local: localResult.success,
          server: true,
          message: 'Solicitud enviada a administradores'
        };
        
      } catch (serverError) {
        console.log('⚠️ Error enviando al servidor (solo local):', serverError.message);
        
        return {
          success: true,
          local: localResult.success,
          server: false,
          message: 'Solicitud enviada localmente'
        };
      }
      
    } catch (error) {
      console.error('❌ Error enviando solicitud de aprobación:', error);
      return {
        success: false,
        error: error.message
      };
    }
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
      userRole: this.userRole,
      mode: this.expoPushToken ? 'push-enabled' : 'local-only',
      isExpoGo: !Device.isDevice || __DEV__
    };
  }

  async getPendingApprovalRequests() {
    try {
      // Intentar obtener desde AsyncStorage
      const stored = await AsyncStorage.getItem('pending_approval_requests');
      if (stored) {
        const requests = JSON.parse(stored);
        console.log('📋 Solicitudes pendientes encontradas:', requests.length);
        return requests;
      }
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes pendientes:', error);
      return [];
    }
  }

  async savePendingApprovalRequest(requestData) {
    try {
      const existing = await this.getPendingApprovalRequests();
      const newRequest = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...requestData
      };
      
      const updated = [...existing, newRequest];
      await AsyncStorage.setItem('pending_approval_requests', JSON.stringify(updated));
      
      console.log('💾 Solicitud de aprobación guardada:', newRequest.id);
      return newRequest;
    } catch (error) {
      console.error('❌ Error guardando solicitud de aprobación:', error);
      return null;
    }
  }

  async removePendingApprovalRequest(requestId) {
    try {
      const existing = await this.getPendingApprovalRequests();
      const filtered = existing.filter(req => req.id !== requestId);
      await AsyncStorage.setItem('pending_approval_requests', JSON.stringify(filtered));
      
      console.log('🗑️ Solicitud de aprobación removida:', requestId);
      return true;
    } catch (error) {
      console.error('❌ Error removiendo solicitud de aprobación:', error);
      return false;
    }
  }

  // === FUNCIONES ESPECÍFICAS PARA EMPLEADOS ===

  async sendApprovalRequestToAdmins(requestData) {
    try {
      console.log('📋 Empleado enviando solicitud de aprobación...', requestData);
      
      const {
        titulo,
        mensaje,
        modulo,
        accion,
        datos_objeto,
        action_type
      } = requestData;

      // Preparar datos para la solicitud
      const approvalRequest = {
        titulo: titulo || '📋 Nueva Solicitud',
        mensaje: mensaje || 'Solicitud pendiente de aprobación',
        modulo: modulo || 'general',
        tipo: 'solicitud',
        usuario_solicitante_nombre: this.userName || 'Empleado',
        requiere_aprobacion: true,
        datos_adicionales: {
          accion: accion,
          datos_objeto: datos_objeto,
          action_type: action_type,
          solicitante_id: this.userId,
          solicitante_nombre: this.userName,
          timestamp: new Date().toISOString()
        }
      };

      // Enviar al servidor para que llegue a todos los administradores
      try {
        console.log('🌐 Enviando solicitud al servidor...');
        
        const serverResult = await apiService.makeRequest('/api/notifications/approval-request', {
          method: 'POST',
          body: JSON.stringify(approvalRequest)
        });
        
        console.log('✅ Solicitud enviada al servidor:', serverResult);

        // También enviar notificación local como confirmación
        await this.sendLocalNotification(
          '📤 Solicitud Enviada',
          `Tu solicitud "${titulo}" ha sido enviada a los administradores`,
          { type: 'confirmation', module: modulo }
        );

        return {
          success: true,
          server: true,
          message: 'Solicitud enviada exitosamente a administradores',
          details: serverResult
        };
        
      } catch (serverError) {
        console.log('⚠️ Error enviando al servidor:', serverError.message);
        
        // Fallback: guardar localmente
        await this.savePendingApprovalRequest({
          titulo: titulo,
          mensaje: mensaje,
          modulo: modulo,
          usuario_solicitante: this.userName,
          approval_data: datos_objeto,
          action_type: action_type
        });

        return {
          success: true,
          server: false,
          message: 'Solicitud guardada localmente (servidor no disponible)'
        };
      }
      
    } catch (error) {
      console.error('❌ Error enviando solicitud de aprobación:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Funciones helper para diferentes tipos de solicitudes
  async requestCreateItem(modulo, itemData) {
    return await this.sendApprovalRequestToAdmins({
      titulo: `➕ Solicitud: Crear ${modulo}`,
      mensaje: `${this.userName} solicita crear: "${itemData.nombre}"`,
      modulo: modulo.toLowerCase(),
      accion: 'crear',
      datos_objeto: itemData,
      action_type: `create_${modulo.toLowerCase()}`
    });
  }

  async requestUpdateItem(modulo, itemData, cambios) {
    return await this.sendApprovalRequestToAdmins({
      titulo: `✏️ Solicitud: Editar ${modulo}`,
      mensaje: `${this.userName} solicita editar: "${itemData.nombre}"`,
      modulo: modulo.toLowerCase(),
      accion: 'editar',
      datos_objeto: { ...itemData, cambios: cambios },
      action_type: `update_${modulo.toLowerCase()}`
    });
  }

  async requestDeleteItem(modulo, itemData) {
    return await this.sendApprovalRequestToAdmins({
      titulo: `🗑️ Solicitud: Eliminar ${modulo}`,
      mensaje: `${this.userName} solicita eliminar: "${itemData.nombre}"`,
      modulo: modulo.toLowerCase(),
      accion: 'eliminar',
      datos_objeto: itemData,
      action_type: `delete_${modulo.toLowerCase()}`
    });
  }
}

// Crear instancia única del servicio
const notificationService = new NotificationService();

export { notificationService };
export default notificationService; 