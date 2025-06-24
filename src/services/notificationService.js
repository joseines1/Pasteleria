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
      // Configuración específica para iOS
      if (Platform.OS === 'ios') {
        console.log('🍎 Configurando notificaciones push para iOS...');
        
        // Verificar que el dispositivo soporte notificaciones push
        if (!Device.isDevice) {
          throw new Error('Las notificaciones push requieren un dispositivo físico');
        }

        // Solicitar permisos específicos para iOS
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          console.log('📱 Solicitando permisos de notificación para iOS...');
          const { status } = await Notifications.requestPermissionsAsync({
            ios: {
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowDisplayInCarPlay: true,
              allowCriticalAlerts: false,
              allowProvisional: false,
              allowAnnouncements: true,
            },
          });
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          throw new Error('Permisos de notificación denegados en iOS');
        }

        console.log('✅ Permisos de notificación iOS concedidos');
      }

      // Obtener token de Expo Push Notifications
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: '5ca808a7-4102-42e5-aae3-cf083ed6e243'
      })).data;
      
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
      // Solo actualizar en servidor si tenemos token de auth y datos de usuario
      if (!this.userId || !this.userName) {
        console.log('ℹ️ Sin datos de usuario - saltando actualización en servidor');
        return;
      }

      // Verificar que el apiService tenga token de auth
      if (!apiService.token) {
        console.log('ℹ️ Sin token de auth - saltando actualización en servidor');
        return;
      }

      console.log('📤 Actualizando push token en servidor...', {
        userId: this.userId,
        userName: this.userName,
        platform: Platform.OS
      });

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
      // Si el endpoint no existe (404) o hay error de auth (401), no es crítico
      if (error.message.includes('404') || error.message.includes('401')) {
        console.log('ℹ️ Push token no pudo actualizarse en servidor (continuando sin él)');
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

  // === MÉTODOS ADICIONALES ===

  async updateTokenAfterLogin(user, authToken) {
    try {
      console.log('🔄 Actualizando configuración post-login...');
      
      // Actualizar información del usuario
      this.userId = user.id;
      this.userName = user.nombre;
      this.userRole = user.rol;
      
      // Configurar token de auth en apiService
      apiService.setAuthToken(authToken);
      
      // Si ya tenemos un push token, actualizarlo en el servidor
      if (this.expoPushToken) {
        console.log('📱 Sincronizando push token con servidor...');
        await this.updatePushTokenOnServer(this.expoPushToken);
      }
      
      console.log('✅ Configuración post-login completada');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en configuración post-login:', error);
      return { success: false, error: error.message };
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
        const response = await apiService.makeRequest('/api/notifications/custom', {
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