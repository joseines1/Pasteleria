import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiService } from './apiService';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
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
  }

  // Registrar para notificaciones push
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pasteleria-staff', {
        name: 'Pastelería Staff',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default'
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Permisos de notificación denegados');
        alert('Para recibir notificaciones de la pastelería, necesitas activar los permisos en configuración.');
        return;
      }
      
      // Obtener el token de Expo
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || '5ca808a7-4102-42e5-aae3-cf083ed6e243',
      })).data;
      
      console.log('🔔 Token de notificación obtenido:', token);
      this.expoPushToken = token;
      
    } else {
      console.log('❌ Debe usar un dispositivo físico para notificaciones push');
      alert('Las notificaciones push solo funcionan en dispositivos físicos, no en simuladores.');
    }

    return token;
  }

  // Enviar token al servidor
  async sendTokenToServer(token) {
    try {
      if (!token) {
        console.log('⚠️ No hay token para enviar al servidor');
        return;
      }

      console.log('📤 Enviando token al servidor:', token);
      
      // Llamar al endpoint del backend para actualizar el push token
      const response = await apiService.makeRequest('/auth/push-token', {
        method: 'PUT',
        body: JSON.stringify({ pushToken: token }),
      });

      console.log('✅ Token enviado al servidor exitosamente:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Error enviando token al servidor:', error);
      throw error;
    }
  }

  // Configurar listeners de notificaciones
  setupNotificationListeners() {
    // Listener para cuando se recibe una notificación mientras la app está en primer plano
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
      
      // Mostrar alerta personalizada con información de la notificación
      const { title, body, data } = notification.request.content;
      
      if (data && data.module) {
        console.log(`📦 Módulo: ${data.module}, Acción: ${data.action}`);
      }
    });

    // Listener para cuando el usuario toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Usuario tocó notificación:', response);
      
      const { data } = response.notification.request.content;
      
      // Navegar a la pantalla correspondiente según el módulo
      if (data && data.module) {
        this.handleNotificationNavigation(data);
      }
    });

    return { notificationListener, responseListener };
  }

  // Manejar navegación cuando se toca una notificación
  handleNotificationNavigation(data) {
    switch (data.module) {
      case 'ingredientes':
        console.log('🎯 Navegar a pantalla de ingredientes');
        // Aquí podrías usar navigation.navigate('Ingredientes')
        break;
      case 'postres':
        console.log('🎯 Navegar a pantalla de postres');
        // Aquí podrías usar navigation.navigate('Postres')
        break;
      case 'recetas':
        console.log('🎯 Navegar a pantalla de recetas');
        // Aquí podrías usar navigation.navigate('Recetas')
        break;
      default:
        console.log('🎯 Navegar a pantalla principal');
        break;
    }
  }

  // Inicializar el servicio completo
  async initialize() {
    try {
      console.log('🚀 Inicializando servicio de notificaciones...');
      
      // 1. Registrar para notificaciones
      const token = await this.registerForPushNotificationsAsync();
      
      // 2. Enviar token al servidor
      if (token) {
        await this.sendTokenToServer(token);
      }
      
      // 3. Configurar listeners
      const listeners = this.setupNotificationListeners();
      
      console.log('✅ Servicio de notificaciones inicializado correctamente');
      
      return { token, listeners };
      
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
      throw error;
    }
  }

  // Limpiar listeners cuando se desmonta el componente
  cleanup(listeners) {
    if (listeners && listeners.notificationListener) {
      Notifications.removeNotificationSubscription(listeners.notificationListener);
    }
    if (listeners && listeners.responseListener) {
      Notifications.removeNotificationSubscription(listeners.responseListener);
    }
  }

  // Obtener el token actual
  getToken() {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService(); 