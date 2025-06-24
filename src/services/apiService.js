// 🌐 Configuración API - SERVIDOR HEROKU
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ✅ SERVIDOR HEROKU EN PRODUCCIÓN
const HEROKU_API_URL = 'https://pasteleria-c6865951d4d7.herokuapp.com';

console.log('🌐 CONFIGURACIÓN: Usando servidor HEROKU');
console.log('🔗 API URL:', HEROKU_API_URL);
console.log('📱 Plataforma:', Platform.OS);
console.log('☁️ Conectando a servidor en la nube');
console.log('🚀 Configuración cargada');

class ApiService {
  constructor() {
    this.baseURL = HEROKU_API_URL;
    this.token = null;
    console.log('🏗️ ApiService inicializado con servidor Heroku:', this.baseURL);
  }

  setBaseUrl(url) {
    this.baseURL = url;
    console.log('🔄 Base URL actualizada a:', this.baseURL);
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
      timeout: 30000, // 30 segundos para servidor Heroku
    };

    console.log('📤 Heroku API Request:', {
      method: options.method || 'GET',
      url: url,
      hasToken: !!this.token,
      timeout: config.timeout
    });

    try {
      // Crear promise con timeout para servidor Heroku
      const fetchPromise = fetch(url, config);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Heroku server timeout después de ${config.timeout}ms`)), config.timeout)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('📥 Heroku API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Heroku API Error:', {
          status: response.status,
          data: data,
          url: url
        });
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      console.log('✅ Heroku API Success:', { endpoint, dataKeys: Object.keys(data) });
      return data;
    } catch (error) {
      console.error('❌ Heroku API Request Error:', {
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