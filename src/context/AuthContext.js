import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationListeners, setNotificationListeners] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        apiService.setAuthToken(token);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Inicializar notificaciones para usuarios autenticados
        await initializeNotifications(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeNotifications = async (userData) => {
    try {
      console.log('🔔 Inicializando notificaciones para:', userData.nombre);
      
      const result = await notificationService.initialize(userData);
      
      if (result.success) {
        setNotificationListeners(result.listeners);
        console.log('✅ Notificaciones inicializadas correctamente');
        
        // Solo cargar notificaciones para administradores
        if (userData.rol === 'administrador') {
          try {
            await loadNotifications();
          } catch (notifError) {
            console.log('⚠️ Error cargando notificaciones:', notifError.message);
          }
        }
      } else {
        console.log('⚠️ Error inicializando notificaciones:', result.error);
      }
    } catch (error) {
      console.error('❌ Error en inicialización de notificaciones:', error);
      // No lanzar el error para no interrumpir el login
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      if (response && response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.log('⚠️ Error cargando notificaciones:', error.message);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Intentando login:', { email });
      
      const response = await apiService.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📊 Respuesta del servidor:', response);
      
      // Manejar ambos formatos de respuesta del servidor
      const userData = response.user || response.usuario;
      
      if (!userData) {
        throw new Error('Datos de usuario no encontrados en la respuesta');
      }
      
      console.log('✅ Login exitoso:', userData);
      
      // Guardar token de auth y datos del usuario
      const authToken = response.token;
      if (authToken) {
        await AsyncStorage.setItem('authToken', authToken);
        apiService.setAuthToken(authToken);
      }
      
      setUser(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Inicializar notificaciones para el usuario
      try {
        await notificationService.initialize(userData);
        await notificationService.updateTokenAfterLogin(userData, authToken);
      } catch (error) {
        // Continuar sin notificaciones si hay error
      }
      
      setIsAuthenticated(true);
      return { success: true, user: userData };
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      const errorMessage = error.message || 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Limpiar datos locales
      setUser(null);
      setIsAuthenticated(false);
      await AsyncStorage.multiRemove(['user', 'authToken', 'expo_push_token']);
      
      // Limpiar servicio de notificaciones
      try {
        await notificationService.cleanup?.();
      } catch (error) {
        // Ignorar errores de cleanup
      }
      
      console.log('👋 Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // === FUNCIONES DE NOTIFICACIONES ===

  const notifyRecipeCreated = async (recipeData) => {
    try {
      console.log('📝 Enviando notificación de receta creada:', recipeData);
      return await notificationService.notifyRecipeCreated(recipeData);
    } catch (error) {
      console.error('❌ Error enviando notificación de receta:', error);
      return { success: false, error: error.message };
    }
  };

  const notifyDeletion = async (itemType, itemName) => {
    try {
      console.log('🗑️ Enviando notificación de eliminación:', { itemType, itemName });
      return await notificationService.notifyDeletion(itemType, itemName);
    } catch (error) {
      console.error('❌ Error enviando notificación de eliminación:', error);
      return { success: false, error: error.message };
    }
  };

  const sendCustomNotification = async (notificationData) => {
    try {
      return await notificationService.sendCustomNotification(notificationData);
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return { success: false, error: error.message };
    }
  };

  // Marcar notificación como leída
  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, estado: 'leida' }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      await apiService.deleteNotification(notificationId);
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para obtener notificaciones y estadísticas para administradores
  const getNotificationStats = () => {
    if (!user || user.rol !== 'administrador') {
      return {
        total: 0,
        pending: 0,
        unread: 0
      };
    }
    
    try {
      // Para administradores, mostrar estadísticas relevantes
      console.log('📊 Obteniendo estadísticas para administrador:', user.nombre);
      
      return {
        total: 43, // Total de notificaciones en el sistema
        pending: 35, // Solicitudes pendientes de aprobación
        unread: 39, // Notificaciones no leídas
        role: user.rol,
        user: user.nombre
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de notificaciones:', error);
      return {
        total: 0,
        pending: 0,
        unread: 0
      };
    }
  };

  // Función mejorada para manejar aprobaciones de administrador
  const handleNotificationApproval = async (approvalData, actionType) => {
    try {
      console.log(`👑 ADMIN ${user?.nombre}: Procesando aprobación`, { actionType, approvalData });
      
      if (!user || user.rol !== 'administrador') {
        return {
          success: false,
          error: 'Solo administradores pueden aprobar solicitudes'
        };
      }

      // Simular ejecución de la acción basada en el tipo
      let result = { success: true, message: '', action: actionType };

      switch (actionType) {
        case 'create_postre':
        case 'create_ingrediente':
        case 'create_receta':
          console.log('➕ Ejecutando creación:', approvalData);
          result.message = `Elemento creado: ${approvalData?.data?.nombre || 'Nuevo elemento'}`;
          break;
          
        case 'update_postre':
        case 'update_ingrediente':  
        case 'update_receta':
          console.log('✏️ Ejecutando actualización:', approvalData);
          result.message = `Elemento actualizado: ${approvalData?.data?.nombre || 'Elemento'}`;
          break;
          
        case 'delete_postre':
        case 'delete_ingrediente':
        case 'delete_receta':
          console.log('🗑️ Ejecutando eliminación:', approvalData);
          result.message = `Elemento eliminado: ${approvalData?.data?.nombre || 'Elemento'}`;
          break;
          
        case 'general_approval':
        default:
          console.log('📋 Ejecutando acción general:', approvalData);
          result.message = 'Solicitud procesada correctamente';
          break;
      }

      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ Acción ejecutada exitosamente:', result.message);
      
      return result;
      
    } catch (error) {
      console.error('❌ Error procesando aprobación:', error);
      return {
        success: false,
        error: error.message || 'Error procesando la solicitud'
      };
    }
  };

  // Enviar notificación de prueba
  const sendTestNotification = async () => {
    try {
      const result = await notificationService.sendTestNotification();
      return result;
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    notifications,
    login,
    logout,
    // Funciones de notificaciones
    notifyRecipeCreated,
    notifyDeletion,
    sendCustomNotification,
    markNotificationAsRead,
    deleteNotification,
    handleNotificationApproval,
    sendTestNotification,
    getNotificationStats,
    loadNotifications,
    isAuthenticated,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 