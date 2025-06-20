import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [notificationListeners, setNotificationListeners] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiService.setAuthToken(storedToken);
        
        // Inicializar notificaciones si el usuario ya está logueado
        initializeNotifications();
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeNotifications = async () => {
    try {
      console.log('🔔 Inicializando notificaciones después del login...');
      const { listeners } = await notificationService.initialize();
      setNotificationListeners(listeners);
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiService.login(email, password);
      
      // La API de mi-proyecto-mvc retorna { message, usuario, token }
      if (response.token && response.usuario) {
        const { usuario: userData, token: authToken } = response;
        
        await AsyncStorage.setItem('token', authToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        setToken(authToken);
        setUser(userData);
        apiService.setAuthToken(authToken);
        
        // Inicializar notificaciones después del login exitoso
        await initializeNotifications();
        
        return { success: true };
      } else {
        return { success: false, message: response.error || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Para demo, permitir login offline con credenciales predeterminadas
      if ((email === 'admin@test.com' && password === 'admin123') || 
          (email === 'empleado@test.com' && password === 'emp123')) {
        const userData = { 
          email: email, 
          rol: email === 'admin@test.com' ? 'administrador' : 'empleado', 
          nombre: email === 'admin@test.com' ? 'Administrador' : 'Empleado Test' 
        };
        setUser(userData);
        
        // Inicializar notificaciones incluso en modo demo
        try {
          await initializeNotifications();
        } catch (notifError) {
          console.log('⚠️ Notificaciones no disponibles en modo demo');
        }
        
        return { success: true };
      }
      return { success: false, message: error.message || 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Limpiar listeners de notificaciones
      if (notificationListeners) {
        notificationService.cleanup(notificationListeners);
        setNotificationListeners(null);
      }
      
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      apiService.setAuthToken(null);
      
      console.log('🔔 Notificaciones limpiadas al hacer logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    notificationListeners,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 