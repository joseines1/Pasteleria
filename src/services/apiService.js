// Configuración de API que se adapta al entorno
const API_CONFIGS = {
  development: {
    localhost: 'http://localhost:3001',
    network: 'http://192.168.1.74:3001',
    heroku: 'https://pasteleria-c6865951d4d7.herokuapp.com'
  }
};

// Detectar si estamos en un dispositivo físico o emulador
const isPhysicalDevice = () => {
  // En React Native podríamos usar Device.isDevice de expo-device
  // Por ahora, usa la configuración de red por defecto para dispositivos físicos
  return true;
};

// Seleccionar la URL apropiada
const getApiUrl = () => {
  // ✅ USANDO LOCALHOST - Servidor local funcionando con Turso
  return API_CONFIGS.development.localhost; // ✅ LOCALHOST (http://localhost:3001) - Para emulador
  
  // 📝 Otras opciones disponibles:
  // return API_CONFIGS.development.network; // Para dispositivos físicos en red local (192.168.1.74:3001)
  // return API_CONFIGS.development.heroku; // Para producción (Heroku)
};

const API_BASE_URL = getApiUrl();

console.log('🔗 Usando API URL:', API_BASE_URL);
console.log('🚀 Conectado a Localhost - Turso Database');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
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

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
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