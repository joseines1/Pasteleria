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
      
      // Guardar datos del usuario
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Inicializar notificaciones con el usuario actual
      try {
        console.log('🔔 Inicializando notificaciones para usuario:', userData.nombre);
        const notificationResult = await notificationService.initialize(userData);
        console.log('🔔 Resultado inicialización notificaciones:', notificationResult);
      } catch (notificationError) {
        console.log('⚠️ Error inicializando notificaciones (continuando sin ellas):', notificationError.message);
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
        await notificationService.cleanup();
        console.log('🧹 Servicio de notificaciones limpiado');
      } catch (error) {
        console.log('⚠️ Error limpiando notificaciones:', error.message);
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
      console.log('📤 Enviando notificación personalizada:', notificationData.title);
      return await notificationService.sendCustomNotification(notificationData);
    } catch (error) {
      console.error('❌ Error enviando notificación personalizada:', error);
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

  // Aprobar/rechazar notificación y ejecutar acción si se aprueba
  const handleNotificationApproval = async (notificationId, action, comment = '') => {
    try {
      // Encontrar la notificación
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) {
        return { success: false, error: 'Notificación no encontrada' };
      }

      // Si se aprueba, ejecutar la acción correspondiente
      if (action === 'aprobada' && notification.datos_adicionales) {
        const data = typeof notification.datos_adicionales === 'string' 
          ? JSON.parse(notification.datos_adicionales) 
          : notification.datos_adicionales;

        try {
          await executeApprovedAction(data);
        } catch (actionError) {
          console.error('Error ejecutando acción aprobada:', actionError);
          // Continuar con la aprobación aunque falle la ejecución
        }
      }

      // Marcar como procesada
      await apiService.approveNotification(notificationId, action, comment);
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, estado: 'leida', accion: action, comentario: comment }
            : n
        )
      );

      // Enviar notificación de respuesta al empleado
      if (notification.usuario_solicitante_nombre && notification.usuario_solicitante_nombre !== 'Sistema') {
        await notifyApprovalResult(notification, action, comment);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error procesando aprobación:', error);
      return { success: false, error: error.message };
    }
  };

  // Ejecutar acción aprobada
  const executeApprovedAction = async (data) => {
    console.log('🚀 Ejecutando acción aprobada:', data);

    const modulo = data.module || data.modulo;
    
    switch (data.action) {
      case 'crear':
        if (modulo === 'postres') {
          await apiService.createPostre(data.newData);
        } else if (modulo === 'ingredientes') {
          await apiService.createIngrediente(data.newData);
        } else if (modulo === 'recetas') {
          await apiService.createReceta(data.newData);
        }
        break;

      case 'actualizar':
        if (modulo === 'postres') {
          await apiService.updatePostre(data.postreId, data.newData);
        } else if (modulo === 'ingredientes') {
          await apiService.updateIngrediente(data.ingredienteId, data.newData);
        } else if (modulo === 'recetas') {
          await apiService.updateReceta(data.recetaId, data.newData);
        }
        break;

      case 'eliminar':
        if (modulo === 'postres') {
          await apiService.deletePostre(data.postreId);
        } else if (modulo === 'ingredientes') {
          await apiService.deleteIngrediente(data.ingredienteId);
        } else if (modulo === 'recetas') {
          await apiService.deleteReceta(data.recetaId);
        }
        break;

      default:
        console.log('⚠️ Acción no reconocida:', data.action);
    }
  };

  // Notificar resultado de aprobación al empleado
  const notifyApprovalResult = async (originalNotification, action, comment) => {
    try {
      const isApproved = action === 'aprobada';
      const icon = isApproved ? '✅' : '❌';
      const status = isApproved ? 'aprobada' : 'rechazada';
      
      const data = typeof originalNotification.datos_adicionales === 'string' 
        ? JSON.parse(originalNotification.datos_adicionales) 
        : originalNotification.datos_adicionales;

      const itemName = data.postre || data.ingrediente || data.receta || 'elemento';
      
      await sendCustomNotification({
        title: `${icon} Solicitud ${status}`,
        message: `Tu solicitud de ${data.action} "${itemName}" ha sido ${status}${comment ? `. Comentario: ${comment}` : '.'}`,
        module: 'respuestas',
        data: {
          solicitud_original_id: originalNotification.id,
          accion_solicitada: data.action,
          elemento: itemName,
          modulo_original: data.modulo,
          aprobada_por: user?.nombre || 'Administrador',
          comentario: comment,
          approved: isApproved
        }
      });
    } catch (error) {
      console.error('Error enviando notificación de respuesta:', error);
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

  // Obtener estadísticas de notificaciones
  const getNotificationStats = () => {
    const unreadCount = notifications.filter(n => n.estado === 'no_leida').length;
    const pendingCount = notifications.filter(n => n.requiere_aprobacion && n.estado === 'no_leida').length;
    const totalCount = notifications.length;

    return {
      unread: unreadCount,
      pending: pendingCount,
      total: totalCount,
      read: totalCount - unreadCount
    };
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