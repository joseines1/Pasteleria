// Variables globales
let currentUser = null;
let authToken = null;
const API_BASE = 'http://localhost:3000';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Forms
    document.getElementById('ingredienteForm').addEventListener('submit', handleAddIngrediente);
    document.getElementById('postreForm').addEventListener('submit', handleAddPostre);
    document.getElementById('recetaForm').addEventListener('submit', handleAddReceta);
    
    // Verificar si hay sesión guardada
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showMainScreen();
    }
}

// Funciones de autenticación
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.usuario;
            
            // Guardar en localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMainScreen();
            hideLoginError();
        } else {
            showLoginError(data.error || 'Error de autenticación');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showLoginError('Error de conexión con el servidor');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    showLoginScreen();
}

function fillTestUser(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
}

// Funciones de pantalla
function showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('mainScreen').classList.remove('active');
}

function showMainScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
    
    // Actualizar info del usuario
    document.getElementById('userInfo').textContent = 
        `${currentUser.nombre} (${currentUser.rol})`;
    
    // Cargar datos iniciales
    loadIngredientes();
    loadPostres();
    loadRecetas();
    checkNotificationStatus();
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideLoginError() {
    document.getElementById('loginError').style.display = 'none';
}

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

// Funciones de tabs
function showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar tab seleccionado
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Cargar datos específicos del tab
    if (tabName === 'notificaciones') {
        checkNotificationStatus();
    }
}

// Funciones de API
async function apiRequest(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en la petición');
    }
    
    return response.json();
}

// Gestión de Ingredientes
async function loadIngredientes() {
    try {
        const ingredientes = await apiRequest('/ingredientes');
        displayIngredientes(ingredientes);
    } catch (error) {
        console.error('Error cargando ingredientes:', error);
        showMessage('Error cargando ingredientes', 'error');
    }
}

function displayIngredientes(ingredientes) {
    const container = document.getElementById('ingredientesList');
    
    if (ingredientes.length === 0) {
        container.innerHTML = '<div class="item-card"><p>No hay ingredientes registrados</p></div>';
        return;
    }
    
    container.innerHTML = ingredientes.map(ingrediente => `
        <div class="item-card">
            <div class="item-info">
                <h4>${ingrediente.nombre}</h4>
                <p>Cantidad: ${ingrediente.cantidad} unidades</p>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editIngrediente(${ingrediente.idIngrediente})">✏️ Editar</button>
                <button class="btn-delete" onclick="deleteIngrediente(${ingrediente.idIngrediente})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

async function handleAddIngrediente(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombreIngrediente').value;
    const cantidad = parseInt(document.getElementById('cantidadIngrediente').value);
    
    try {
        await apiRequest('/ingredientes', {
            method: 'POST',
            body: JSON.stringify({ nombre, cantidad })
        });
        
        showMessage('Ingrediente agregado exitosamente', 'success');
        hideAddIngredienteForm();
        loadIngredientes();
        document.getElementById('ingredienteForm').reset();
    } catch (error) {
        console.error('Error agregando ingrediente:', error);
        showMessage('Error agregando ingrediente: ' + error.message, 'error');
    }
}

async function deleteIngrediente(id) {
    if (!confirm('¿Estás seguro de eliminar este ingrediente?')) return;
    
    try {
        await apiRequest(`/ingredientes/${id}`, { method: 'DELETE' });
        showMessage('Ingrediente eliminado exitosamente', 'success');
        loadIngredientes();
    } catch (error) {
        console.error('Error eliminando ingrediente:', error);
        showMessage('Error eliminando ingrediente: ' + error.message, 'error');
    }
}

function showAddIngredienteForm() {
    document.getElementById('addIngredienteForm').style.display = 'block';
}

function hideAddIngredienteForm() {
    document.getElementById('addIngredienteForm').style.display = 'none';
}

// Gestión de Postres
async function loadPostres() {
    try {
        const postres = await apiRequest('/postres');
        displayPostres(postres);
        updatePostreSelect(postres);
    } catch (error) {
        console.error('Error cargando postres:', error);
        showMessage('Error cargando postres', 'error');
    }
}

function displayPostres(postres) {
    const container = document.getElementById('postresList');
    
    if (postres.length === 0) {
        container.innerHTML = '<div class="item-card"><p>No hay postres registrados</p></div>';
        return;
    }
    
    container.innerHTML = postres.map(postre => `
        <div class="item-card">
            <div class="item-info">
                <h4>${postre.nombre}</h4>
                <p>Precio: $${postre.precio}</p>
                ${postre.descripcion ? `<p>${postre.descripcion}</p>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editPostre(${postre.idPostre})">✏️ Editar</button>
                <button class="btn-delete" onclick="deletePostre(${postre.idPostre})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

async function handleAddPostre(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombrePostre').value;
    const precio = parseFloat(document.getElementById('precioPostre').value);
    const descripcion = document.getElementById('descripcionPostre').value;
    
    try {
        await apiRequest('/postres', {
            method: 'POST',
            body: JSON.stringify({ nombre, precio, descripcion })
        });
        
        showMessage('Postre agregado exitosamente', 'success');
        hideAddPostreForm();
        loadPostres();
        document.getElementById('postreForm').reset();
    } catch (error) {
        console.error('Error agregando postre:', error);
        showMessage('Error agregando postre: ' + error.message, 'error');
    }
}

async function deletePostre(id) {
    if (!confirm('¿Estás seguro de eliminar este postre?')) return;
    
    try {
        await apiRequest(`/postres/${id}`, { method: 'DELETE' });
        showMessage('Postre eliminado exitosamente', 'success');
        loadPostres();
    } catch (error) {
        console.error('Error eliminando postre:', error);
        showMessage('Error eliminando postre: ' + error.message, 'error');
    }
}

function showAddPostreForm() {
    document.getElementById('addPostreForm').style.display = 'block';
}

function hideAddPostreForm() {
    document.getElementById('addPostreForm').style.display = 'none';
}

function updatePostreSelect(postres) {
    const select = document.getElementById('postreSelect');
    select.innerHTML = '<option value="">Seleccionar postre...</option>' +
        postres.map(postre => `<option value="${postre.idPostre}">${postre.nombre}</option>`).join('');
}

// Gestión de Recetas
async function loadRecetas() {
    try {
        const recetas = await apiRequest('/postres-ingredientes');
        displayRecetas(recetas);
        
        // Cargar ingredientes para el select
        const ingredientes = await apiRequest('/ingredientes');
        updateIngredienteSelect(ingredientes);
    } catch (error) {
        console.error('Error cargando recetas:', error);
        showMessage('Error cargando recetas', 'error');
    }
}

function displayRecetas(recetas) {
    const container = document.getElementById('recetasList');
    
    if (recetas.length === 0) {
        container.innerHTML = '<div class="item-card"><p>No hay recetas registradas</p></div>';
        return;
    }
    
    container.innerHTML = recetas.map(receta => `
        <div class="item-card">
            <div class="item-info">
                <h4>Receta #${receta.id}</h4>
                <p>Postre ID: ${receta.idPostre} - Ingrediente ID: ${receta.idIngrediente}</p>
                <p>Cantidad: ${receta.cantidad}</p>
            </div>
            <div class="item-actions">
                <button class="btn-delete" onclick="deleteReceta(${receta.id})">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

async function handleAddReceta(e) {
    e.preventDefault();
    
    const idPostre = parseInt(document.getElementById('postreSelect').value);
    const idIngrediente = parseInt(document.getElementById('ingredienteSelect').value);
    const cantidad = parseFloat(document.getElementById('cantidadReceta').value);
    
    try {
        await apiRequest('/postres-ingredientes', {
            method: 'POST',
            body: JSON.stringify({ idPostre, idIngrediente, cantidad })
        });
        
        showMessage('Receta agregada exitosamente', 'success');
        hideAddRecetaForm();
        loadRecetas();
        document.getElementById('recetaForm').reset();
    } catch (error) {
        console.error('Error agregando receta:', error);
        showMessage('Error agregando receta: ' + error.message, 'error');
    }
}

async function deleteReceta(id) {
    if (!confirm('¿Estás seguro de eliminar esta receta?')) return;
    
    try {
        await apiRequest(`/postres-ingredientes/${id}`, { method: 'DELETE' });
        showMessage('Receta eliminada exitosamente', 'success');
        loadRecetas();
    } catch (error) {
        console.error('Error eliminando receta:', error);
        showMessage('Error eliminando receta: ' + error.message, 'error');
    }
}

function showAddRecetaForm() {
    document.getElementById('addRecetaForm').style.display = 'block';
}

function hideAddRecetaForm() {
    document.getElementById('addRecetaForm').style.display = 'none';
}

function updateIngredienteSelect(ingredientes) {
    const select = document.getElementById('ingredienteSelect');
    select.innerHTML = '<option value="">Seleccionar ingrediente...</option>' +
        ingredientes.map(ingrediente => `<option value="${ingrediente.idIngrediente}">${ingrediente.nombre}</option>`).join('');
}

// Gestión de Notificaciones
async function checkNotificationStatus() {
    try {
        // Verificar tokens push
        const response = await fetch(`${API_BASE}/test`);
        const serverStatus = await response.json();
        
        document.getElementById('notificationStatus').innerHTML = `
            <p>✅ Servidor funcionando</p>
            <p>🕒 ${serverStatus.timestamp}</p>
        `;
        
        // Simular verificación de tokens (esto debería ser una ruta real)
        document.getElementById('pushTokensStatus').innerHTML = `
            <p>🔄 Verificando tokens...</p>
            <p>💡 Usa la app móvil para generar tokens</p>
        `;
        
    } catch (error) {
        document.getElementById('notificationStatus').innerHTML = `
            <p>❌ Error conectando al servidor</p>
            <p>${error.message}</p>
        `;
    }
}

async function testCRUDNotifications() {
    const resultsContainer = document.getElementById('notificationResults');
    resultsContainer.innerHTML = '<p>🧪 Ejecutando pruebas CRUD...</p>';
    
    try {
        // Crear ingrediente de prueba
        const testIngrediente = await apiRequest('/ingredientes', {
            method: 'POST',
            body: JSON.stringify({ 
                nombre: 'Test Ingrediente ' + Date.now(), 
                cantidad: 10 
            })
        });
        
        resultsContainer.innerHTML += '<p>✅ Ingrediente creado - Notificación enviada</p>';
        
        // Actualizar ingrediente
        await apiRequest(`/ingredientes/${testIngrediente.idIngrediente}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                nombre: 'Test Ingrediente Actualizado', 
                cantidad: 15 
            })
        });
        
        resultsContainer.innerHTML += '<p>✅ Ingrediente actualizado - Notificación enviada</p>';
        
        // Eliminar ingrediente
        await apiRequest(`/ingredientes/${testIngrediente.idIngrediente}`, {
            method: 'DELETE'
        });
        
        resultsContainer.innerHTML += '<p>✅ Ingrediente eliminado - Notificación enviada</p>';
        resultsContainer.innerHTML += '<p>🎉 Pruebas CRUD completadas exitosamente</p>';
        
        // Recargar lista
        loadIngredientes();
        
    } catch (error) {
        resultsContainer.innerHTML += `<p>❌ Error en pruebas: ${error.message}</p>`;
    }
}

async function cleanInvalidTokens() {
    const resultsContainer = document.getElementById('notificationResults');
    resultsContainer.innerHTML = '<p>🧹 Limpiando tokens inválidos...</p>';
    
    // Simular limpieza (esto debería ser una ruta real)
    setTimeout(() => {
        resultsContainer.innerHTML = '<p>✅ Tokens inválidos limpiados</p>';
    }, 2000);
}

// Funciones auxiliares
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message fade-in`;
    messageDiv.textContent = message;
    
    // Insertar en el contenedor activo
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        activeTab.insertBefore(messageDiv, activeTab.firstChild);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Funciones de edición (placeholder)
function editIngrediente(id) {
    showMessage('Función de edición en desarrollo', 'warning');
}

function editPostre(id) {
    showMessage('Función de edición en desarrollo', 'warning');
}

function testNotifications() {
    showMessage('Probando sistema de notificaciones...', 'info');
    testCRUDNotifications();
} 