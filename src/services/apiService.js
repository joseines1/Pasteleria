// Configuración de API que se adapta al entorno
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_CONFIGS = {
  development: {
    localhost: 'http://localhost:3001',
    network: 'http://192.168.1.74:3001',
    heroku: 'https://pasteleria-c6865951d4d7.herokuapp.com'
  }
};

// Detectar el entorno automáticamente
const getApiUrl = () => {
  // 🔍 DETECCIÓN AUTOMÁTICA DEL ENTORNO
  const isExpoGo = Constants.appOwnership === 'expo';
  const isWeb = Platform.OS === 'web';
  const isDev = __DEV__;
  
  console.log('🔍 Detectando entorno...');
  console.log('- Platform:', Platform.OS);
  console.log('- __DEV__:', isDev);
  console.log('- App Ownership:', Constants.appOwnership);
  console.log('- Is Expo Go:', isExpoGo);
  console.log('- Debug Remote JS:', Constants.debugRemoteJS);
  
  // 🌐 LÓGICA DE SELECCIÓN DE URL
  if (isWeb) {
    // En web, siempre usar Heroku (no puede acceder a localhost)
    console.log('🌐 Detected: WEB - Using Heroku');
    return API_CONFIGS.development.heroku;
  }
  
  if (isExpoGo) {
    // En Expo Go (dispositivo físico), usar Heroku para evitar problemas de red
    console.log('📱 Detected: EXPO GO - Using Heroku');
    return API_CONFIGS.development.heroku;
  }
  
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // En emulador o build nativo, usar localhost primero, luego Heroku
    if (isDev) {
      console.log('🤖 Detected: EMULATOR/DEV BUILD - Using localhost');
      return API_CONFIGS.development.localhost;
    } else {
      console.log('📦 Detected: PRODUCTION BUILD - Using Heroku');
      return API_CONFIGS.development.heroku;
    }
  }
  
  // Default: Heroku (más confiable)
  console.log('🌐 Default: Using Heroku');
  return API_CONFIGS.development.heroku;
};

const API_BASE_URL = getApiUrl();

console.log('🔗 API URL seleccionada:', API_BASE_URL);
console.log('🚀 Configuración de API cargada');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    console.log('🏗️ ApiService inicializado con:', this.baseURL);
  }

  setAuthToken(token) {
    this.token = token;
    console.log('🔑 Token de auth configurado:', token ? 'SÍ' : 'NO');
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    console.log('📤 API Request:', {
      method: options.method || 'GET',
      url: url,
      hasToken: !!this.token,
      headers: Object.keys(headers)
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          data: data,
          url: url
        });
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      console.log('✅ API Success:', { endpoint, dataKeys: Object.keys(data) });
      return data;
    } catch (error) {
      console.error('❌ API Request Error:', {
        endpoint,
        url,
        error: error.message,
        name: error.name
      });
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    console.log('🔐 Intentando login con:', { email, hasPassword: !!password });
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Postres endpoints
  async getPostres() {
    console.log('🔍 Obteniendo postres desde API...');
    const response = await this.makeRequest('/postres');
    console.log('✅ Postres obtenidos:', response);
    
    // Mapear el formato de la base de datos al formato esperado por la app
    return response.map(postre => ({
      id: postre.idPostre,
      nombre: postre.nombrePostre,
      // Campo precio removido
    }));
  }

  async getPostreById(id) {
    return this.makeRequest(`/postres/${id}`);
  }

  async createPostre(postreData) {
    return this.makeRequest('/postres', {
      method: 'POST',
      body: JSON.stringify({ 
        nombrePostre: postreData.nombre 
      }),
    });
  }

  async updatePostre(id, postreData) {
    return this.makeRequest(`/postres/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        nombrePostre: postreData.nombre 
      }),
    });
  }

  async deletePostre(id) {
    return this.makeRequest(`/postres/${id}`, {
      method: 'DELETE',
    });
  }

  // Ingredientes endpoints
  async getIngredientes() {
    console.log('🔍 Obteniendo ingredientes desde API...');
    const response = await this.makeRequest('/ingredientes');
    console.log('✅ Ingredientes obtenidos:', response);
    
    // Mapear el formato de la base de datos al formato esperado por la app
    return response.map(ingrediente => ({
      id: ingrediente.idIngrediente,
      nombre: ingrediente.nombreIngrediente,
      stock: ingrediente.existencias,
      unidad: ingrediente.unidad || 'und'
    }));
  }

  async getIngredienteById(id) {
    return this.makeRequest(`/ingredientes/${id}`);
  }

  async createIngrediente(ingredienteData) {
    return this.makeRequest('/ingredientes', {
      method: 'POST',
      body: JSON.stringify({
        nombreIngrediente: ingredienteData.nombre,
        existencias: ingredienteData.stock
      }),
    });
  }

  async updateIngrediente(id, ingredienteData) {
    return this.makeRequest(`/ingredientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombreIngrediente: ingredienteData.nombre,
        existencias: ingredienteData.stock
      }),
    });
  }

  async deleteIngrediente(id) {
    return this.makeRequest(`/ingredientes/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async checkHealth() {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      return { status: 'Offline', uptime: 0 };
    }
  }

  // Test endpoint
  async testConnection() {
    try {
      return await this.makeRequest('/test');
    } catch (error) {
      return { message: 'Conexión no disponible - usando datos demo' };
    }
  }

  // === RECETAS (PostresIngredientes) ===
  async getRecetas() {
    console.log('🔍 Obteniendo recetas desde API...');
    const response = await this.makeRequest('/postres-ingredientes');
    console.log('✅ Recetas obtenidas:', response);
    
    return response.map(receta => ({
      id: receta.id,
      idPostre: receta.idPostre,
      idIngrediente: receta.idIngrediente,
      cantidad: receta.Cantidad,
      postreNombre: receta.postre_nombre,
      ingredienteNombre: receta.ingrediente_nombre
    }));
  }

  async getRecetasByPostre(idPostre) {
    console.log(`🔍 Obteniendo recetas del postre ${idPostre}...`);
    const response = await this.makeRequest(`/postres-ingredientes/postre/${idPostre}`);
    console.log('✅ Recetas del postre obtenidas:', response);
    
    return response.map(receta => ({
      id: receta.id,
      idPostre: receta.idPostre,
      idIngrediente: receta.idIngrediente,
      cantidad: receta.Cantidad,
      postreNombre: receta.postre_nombre,
      ingredienteNombre: receta.ingrediente_nombre
    }));
  }

  async createReceta(receta) {
    return this.makeRequest('/postres-ingredientes', {
      method: 'POST',
      body: JSON.stringify({
        idPostre: receta.idPostre,
        idIngrediente: receta.idIngrediente,
        Cantidad: receta.cantidad
      }),
    });
  }

  async updateReceta(id, receta) {
    return this.makeRequest(`/postres-ingredientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        idPostre: receta.idPostre,
        idIngrediente: receta.idIngrediente,
        Cantidad: receta.cantidad
      }),
    });
  }

  async deleteReceta(id) {
    return this.makeRequest(`/postres-ingredientes/${id}`, {
      method: 'DELETE',
    });
  }

  // === NOTIFICACIONES ===
  async getNotifications() {
    console.log('🔔 Obteniendo notificaciones desde API...');
    const response = await this.makeRequest('/api/notifications');
    console.log('✅ Notificaciones obtenidas:', response);
    return response;
  }

  async getNotificationStats() {
    console.log('📊 Obteniendo estadísticas de notificaciones...');
    const response = await this.makeRequest('/api/notifications/stats');
    console.log('✅ Estadísticas obtenidas:', response);
    return response;
  }

  async markNotificationAsRead(notificationId) {
    console.log(`👀 Marcando notificación ${notificationId} como leída...`);
    return this.makeRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    console.log(`🗑️ Eliminando notificación ${notificationId}...`);
    return this.makeRequest(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async approveNotification(notificationId, action, comment = '') {
    console.log(`✅ ${action === 'aprobada' ? 'Aprobando' : 'Rechazando'} notificación ${notificationId}...`);
    return this.makeRequest(`/api/notifications/${notificationId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ action, comment }),
    });
  }

  async createCustomNotification(customRequest) {
    console.log('📤 Creando solicitud personalizada...');
    return this.makeRequest('/api/notifications/custom', {
      method: 'POST',
      body: JSON.stringify(customRequest),
    });
  }

  async getPendingApprovals() {
    console.log('⏳ Obteniendo solicitudes pendientes...');
    return this.makeRequest('/api/notifications/pending');
  }
}

export const apiService = new ApiService();
export default new ApiService(); 