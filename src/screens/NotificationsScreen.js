import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { notificationService } from '../services/notificationService';

const NotificationsScreen = () => {
  const { user, handleNotificationApproval } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [customNotification, setCustomNotification] = useState({
    titulo: '',
    mensaje: '',
    modulo: 'general',
    tipo: 'info'
  });
  const [processingApproval, setProcessingApproval] = useState(null);

  useEffect(() => {
    loadNotifications();
    checkServiceStatus();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedFilter]);

  const checkServiceStatus = () => {
    const status = notificationService.getServiceStatus();
    setServiceStatus(status);
    console.log('📊 Estado del servicio:', status);
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // PANEL DE ADMINISTRADOR - Solicitudes pendientes reales
      console.log('👑 CARGANDO PANEL DE ADMINISTRADOR...');
      
      // Cargar solicitudes pendientes desde el servicio de notificaciones
      const pendingFromStorage = await notificationService.getPendingApprovalRequests?.() || [];
      
      // Datos demo para administradores con solicitudes pendientes
      const adminNotifications = [
        {
          id: 'demo-1',
          titulo: '🛠️ Panel de Administrador Activo',
          mensaje: 'Bienvenido al panel de administrador. Aquí verás todas las solicitudes de aprobación.',
          tipo: 'info',
          estado: 'no_leida',
          created_at: new Date().toISOString(),
          modulo: 'sistema',
          usuario_destinatario_id: user?.id,
          usuario_solicitante_nombre: 'Sistema',
          requiere_aprobacion: false,
          prioridad: 'baja'
        },
        // Agregar solicitudes pendientes del storage
        ...pendingFromStorage.map(request => ({
          id: `pending-${request.id || Date.now()}`,
          titulo: `🔔 ${request.titulo || 'Solicitud de Aprobación'}`,
          mensaje: request.mensaje || 'Solicitud pendiente de aprobación',
          tipo: 'warning',
          estado: 'no_leida',
          created_at: request.timestamp || new Date().toISOString(),
          modulo: request.modulo || 'general',
          usuario_destinatario_id: user?.id,
          usuario_solicitante_nombre: request.usuario_solicitante || 'Empleado',
          requiere_aprobacion: true,
          prioridad: 'alta',
          approval_data: request.approval_data,
          action_type: request.action_type
        }))
      ];

      // Solicitudes demo adicionales para mostrar funcionalidad
      const demoRequests = [
        {
          id: 'demo-req-1',
          titulo: '➕ Solicitud: Crear Ingrediente',
          mensaje: 'Juan Pérez solicita crear: "Chocolate Premium" (500g)',
          tipo: 'warning',
          estado: 'no_leida',
          created_at: new Date(Date.now() - 300000).toISOString(),
          modulo: 'ingredientes',
          usuario_destinatario_id: user?.id,
          usuario_solicitante_nombre: 'Juan Pérez',
          requiere_aprobacion: true,
          prioridad: 'alta',
          approval_data: {
            action: 'create',
            data: { nombre: 'Chocolate Premium', stock: 500, unidad: 'g' }
          },
          action_type: 'create_ingredient'
        },
        {
          id: 'demo-req-2',
          titulo: '✏️ Solicitud: Editar Postre',
          mensaje: 'María García solicita editar: "Tarta de Fresa" - cambiar precio',
          tipo: 'info',
          estado: 'no_leida',
          created_at: new Date(Date.now() - 600000).toISOString(),
          modulo: 'postres',
          usuario_destinatario_id: user?.id,
          usuario_solicitante_nombre: 'María García',
          requiere_aprobacion: true,
          prioridad: 'media',
          approval_data: {
            action: 'edit',
            data: { id: 1, nombre: 'Tarta de Fresa', precio: 25.99 }
          },
          action_type: 'edit_postre'
        },
        {
          id: 'demo-req-3',
          titulo: '🗑️ Solicitud: Eliminar Receta',
          mensaje: 'Carlos López solicita eliminar receta: "Brownie Simple" (descontinuada)',
          tipo: 'error',
          estado: 'no_leida',
          created_at: new Date(Date.now() - 900000).toISOString(),
          modulo: 'recetas',
          usuario_destinatario_id: user?.id,
          usuario_solicitante_nombre: 'Carlos López',
          requiere_aprobacion: true,
          prioridad: 'alta',
          approval_data: {
            action: 'delete',
            data: { id: 3, nombre: 'Brownie Simple' }
          },
          action_type: 'delete_receta'
        }
      ];

      // Combinar notificaciones administrativas y solicitudes demo
      const allNotifications = [...adminNotifications, ...demoRequests];
      
      // Separar solicitudes pendientes
      const pending = allNotifications.filter(n => n.requiere_aprobacion && n.estado === 'no_leida');
      
      setNotifications(allNotifications);
      setPendingRequests(pending);
      
      // Intentar cargar datos reales
      try {
        const response = await apiService.getNotifications();
        if (response && response.notifications) {
          // Filtrar solo notificaciones para este usuario
          const userNotifications = response.notifications.filter(
            notif => notif.usuario_destinatario_id === user?.id || 
                    (user?.rol === 'administrador' && notif.tipo === 'admin')
          );
          setNotifications(userNotifications);
        }
      } catch (error) {
        console.log('Usando datos demo:', error.message);
      }
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];
    
    switch (selectedFilter) {
      case 'unread':
        filtered = notifications.filter(n => n.estado === 'no_leida');
        break;
      case 'read':
        filtered = notifications.filter(n => n.estado === 'leida');
        break;
      case 'pending':
        filtered = notifications.filter(n => n.requiere_aprobacion && n.estado === 'no_leida');
        break;
      case 'sistema':
        filtered = notifications.filter(n => n.modulo === 'sistema');
        break;
      case 'recetas':
        filtered = notifications.filter(n => n.modulo === 'recetas');
        break;
      case 'ingredientes':
        filtered = notifications.filter(n => n.modulo === 'ingredientes');
        break;
      case 'postres':
        filtered = notifications.filter(n => n.modulo === 'postres');
        break;
      case 'general':
        filtered = notifications.filter(n => n.modulo === 'general');
        break;
      default:
        // 'all' - no filter
        break;
    }
    
    setFilteredNotifications(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    checkServiceStatus();
  };

  // Función para probar notificaciones
  const testNotifications = async () => {
    try {
      const result = await notificationService.sendTestNotification();
      
      if (result.success) {
        Alert.alert(
          '🎉 ¡Prueba Exitosa!',
          `Notificación de prueba enviada\nModo: ${result.mode}\n\n${serviceStatus?.isExpoGo ? '📱 Deberías ver una notificación local en unos segundos' : '📱 Deberías recibir una push notification'}`,
          [{ text: 'Perfecto', style: 'default' }]
        );
        
        // Recargar notificaciones después de 2 segundos
        setTimeout(() => {
          loadNotifications();
        }, 2000);
        
      } else {
        Alert.alert('❌ Error', result.error || 'No se pudo enviar la notificación de prueba');
      }
    } catch (error) {
      console.error('Error en prueba:', error);
      Alert.alert('❌ Error', 'Error en la prueba de notificaciones');
    }
  };

  // UPDATE: Marcar como leída
  const markAsRead = async (notificationId) => {
    try {
      // Actualizar localmente primero para UX inmediata
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, estado: 'leida' }
            : notification
        )
      );

      // Intentar actualizar en el servidor
      try {
        await apiService.markNotificationAsRead(notificationId);
      } catch (error) {
        console.log('Error marcando como leída en servidor:', error.message);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // DELETE: Eliminar notificación
  const deleteNotification = async (notificationId) => {
    Alert.alert(
      '🗑️ Eliminar Notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Eliminar localmente primero
              setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
              );

              // Intentar eliminar en el servidor
              try {
                await apiService.deleteNotification(notificationId);
                Alert.alert('✅ Eliminada', 'La notificación ha sido eliminada');
              } catch (error) {
                console.log('Error eliminando en servidor:', error.message);
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'No se pudo eliminar la notificación');
            }
          }
        }
      ]
    );
  };

  // CREATE: Crear notificación personalizada
  const createCustomNotification = async () => {
    if (!customNotification.titulo || !customNotification.mensaje) {
      Alert.alert('Error', 'El título y mensaje son obligatorios');
      return;
    }

    try {
      const newNotification = {
        id: Date.now(), // ID temporal
        titulo: customNotification.titulo,
        mensaje: customNotification.mensaje,
        tipo: customNotification.tipo,
        modulo: customNotification.modulo,
        estado: 'no_leida',
        created_at: new Date().toISOString(),
        usuario_destinatario_id: user?.id,
        usuario_solicitante_nombre: user?.nombre || 'Tú',
        requiere_aprobacion: false
      };

      // Agregar localmente primero
      setNotifications(prev => [newNotification, ...prev]);

      // Enviar usando el servicio de notificaciones
      try {
        await notificationService.sendCustomNotification(customNotification, user?.nombre || 'Usuario');
        Alert.alert(
          '🎉 Creada', 
          `Notificación personalizada enviada\nModo: ${serviceStatus?.mode || 'desconocido'}\n\n${serviceStatus?.isExpoGo ? '📱 Notificación local programada' : '📱 Push notification enviada'}`
        );
      } catch (error) {
        console.log('Error enviando notificación:', error.message);
        Alert.alert('📱 Modo Local', 'Notificación creada localmente (servidor no disponible)');
      }

      // Limpiar formulario y cerrar modal
      setCustomNotification({ titulo: '', mensaje: '', modulo: 'general', tipo: 'info' });
      setCustomModalVisible(false);
      
    } catch (error) {
      console.error('Error creating notification:', error);
      Alert.alert('Error', 'No se pudo crear la notificación');
    }
  };

  // Función para aprobar/rechazar solicitudes
  const handleApproval = async (notification, action) => {
    try {
      // Verificar que tengamos los datos necesarios
      if (!notification.approval_data || !notification.action_type) {
        Alert.alert('Error', 'Esta solicitud no tiene datos suficientes para ser procesada');
        return;
      }

      setProcessingApproval(notification.id);

      Alert.alert(
        `${action === 'approve' ? '✅ Aprobar' : '❌ Rechazar'} Solicitud`,
        `${notification.titulo}\n\n${notification.mensaje}\n\n¿Confirmar ${action === 'approve' ? 'aprobación' : 'rechazo'}?`,
        [
          { 
            text: 'Cancelar', 
            style: 'cancel',
            onPress: () => setProcessingApproval(null)
          },
          {
            text: action === 'approve' ? '✅ Aprobar' : '❌ Rechazar',
            style: action === 'approve' ? 'default' : 'destructive',
            onPress: async () => {
              try {
                console.log(`👑 ADMIN: ${action === 'approve' ? 'Aprobando' : 'Rechazando'} solicitud:`, notification.id);
                
                if (action === 'approve') {
                  // Usar la función del AuthContext para ejecutar la acción
                  const result = await handleNotificationApproval(notification.approval_data, notification.action_type);
                  
                  if (result.success) {
                    console.log('✅ Acción ejecutada exitosamente:', result);
                    
                    Alert.alert(
                      '✅ Solicitud Aprobada',
                      `La solicitud ha sido aprobada y ejecutada:\n\n${notification.titulo}\n\nEl empleado será notificado.`,
                      [{ text: 'Perfecto', style: 'default' }]
                    );
                  } else {
                    throw new Error(result.error || 'Error ejecutando la acción');
                  }
                } else {
                  console.log('❌ Solicitud rechazada por el administrador');
                  
                  Alert.alert(
                    '❌ Solicitud Rechazada',
                    `La solicitud ha sido rechazada:\n\n${notification.titulo}\n\nEl empleado será notificado.`,
                    [{ text: 'OK', style: 'default' }]
                  );
                }
                
                // Actualizar estado de la notificación
                setNotifications(prev => prev.map(notif => 
                  notif.id === notification.id 
                    ? { ...notif, estado: 'procesada', resultado: action, fecha_procesada: new Date().toISOString() }
                    : notif
                ));
                
                // Actualizar solicitudes pendientes
                setPendingRequests(prev => prev.filter(req => req.id !== notification.id));
                
                // Recargar notificaciones
                setTimeout(() => {
                  loadNotifications();
                }, 1000);
                
              } catch (error) {
                console.error('❌ Error procesando solicitud:', error);
                Alert.alert(
                  'Error',
                  `No se pudo ${action === 'approve' ? 'aprobar' : 'rechazar'} la solicitud:\n\n${error.message}`
                );
              } finally {
                setProcessingApproval(null);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error en handleApproval:', error);
      Alert.alert('Error', 'No se pudo procesar la solicitud');
      setProcessingApproval(null);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'info': return '📢';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const getNotificationColor = (estado, tipo) => {
    if (estado === 'leida') return '#F8F9FA';
    
    switch (tipo) {
      case 'warning': return '#FFF3CD';
      case 'error': return '#F8D7DA';
      case 'success': return '#D4EDDA';
      default: return '#E3F2FD';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (minutes < 1) return 'Ahora';
      if (minutes < 60) return `Hace ${minutes}m`;
      if (hours < 24) return `Hace ${hours}h`;
      if (days < 7) return `Hace ${days}d`;
      
      return date.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha no válida';
    }
  };

  const renderFilterButton = (filter, label, icon) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.activeFilterButton
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.activeFilterButtonText
      ]}>
        {icon} {label}
      </Text>
    </TouchableOpacity>
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: getNotificationColor(item.estado, item.tipo) }
      ]}
      onPress={() => {
        if (item.estado === 'no_leida') {
          markAsRead(item.id);
        }
      }}
      onLongPress={() => deleteNotification(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>{getNotificationIcon(item.tipo)}</Text>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.titulo}</Text>
          <Text style={styles.notificationDate}>{formatDate(item.created_at)}</Text>
        </View>
        {item.estado === 'no_leida' && <View style={styles.unreadIndicator} />}
      </View>
      
      <Text style={styles.notificationMessage}>{item.mensaje}</Text>
      
      <View style={styles.notificationFooter}>
        <Text style={styles.notificationModule}>📁 {item.modulo}</Text>
        <Text style={styles.notificationSender}>👤 {item.usuario_solicitante_nombre}</Text>
      </View>

      {/* Botones de aprobación para solicitudes pendientes */}
      {item.requiere_aprobacion && item.estado === 'no_leida' && (
        <View style={styles.approvalButtons}>
          <TouchableOpacity
            style={[
              styles.approvalButton, 
              styles.approveButton,
              processingApproval === item.id && styles.disabledButton
            ]}
            onPress={() => handleApproval(item, 'approve')}
            disabled={processingApproval === item.id}
          >
            <Text style={styles.approvalButtonText}>
              {processingApproval === item.id ? '⏳' : '✅'} Aprobar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.approvalButton, 
              styles.rejectButton,
              processingApproval === item.id && styles.disabledButton
            ]}
            onPress={() => handleApproval(item, 'reject')}
            disabled={processingApproval === item.id}
          >
            <Text style={styles.approvalButtonText}>
              {processingApproval === item.id ? '⏳' : '❌'} Rechazar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Indicador de acción tomada */}
      {item.accion && (
        <View style={styles.actionIndicator}>
          <Text style={styles.actionText}>
            {item.accion === 'aprobada' ? '✅ Aprobada' : '❌ Rechazada'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => n.estado === 'no_leida').length;
  const pendingCount = notifications.filter(n => n.requiere_aprobacion && n.estado === 'no_leida').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Panel Admin</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{unreadCount}</Text>
            <Text style={styles.statLabel}>No leídas</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      {/* Estado del servicio de notificaciones */}
      {serviceStatus && (
        <View style={[
          styles.serviceStatus,
          { backgroundColor: serviceStatus.isExpoGo ? '#FFF3CD' : '#D4EDDA' }
        ]}>
          <Text style={styles.serviceStatusTitle}>
            {serviceStatus.isExpoGo ? '📱 Expo Go - Notificaciones Locales' : '🏗️ Development Build - Push Notifications'}
          </Text>
          <Text style={styles.serviceStatusText}>
            Modo: {serviceStatus.mode} • Listeners: {serviceStatus.listeners} • Token: {serviceStatus.hasToken ? '✅' : '❌'}
          </Text>
        </View>
      )}

      {/* Información de administrador */}
      <View style={styles.adminInfo}>
        <Text style={styles.adminTitle}>👑 Centro de Notificaciones</Text>
        <Text style={styles.adminSubtitle}>Gestiona todas las notificaciones del sistema</Text>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {renderFilterButton('all', 'Todas', '📋')}
        {renderFilterButton('unread', 'No leídas', '🔴')}
        {renderFilterButton('pending', 'Pendientes', '⏳')}
        {renderFilterButton('sistema', 'Sistema', '⚙️')}
        {renderFilterButton('recetas', 'Recetas', '📝')}
        {renderFilterButton('ingredientes', 'Ingredientes', '🥫')}
        {renderFilterButton('postres', 'Postres', '🧁')}
        {renderFilterButton('general', 'General', '📢')}
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.testButton]}
          onPress={testNotifications}
        >
          <Text style={styles.actionButtonText}>🧪 Probar Notificaciones</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.createButton]}
          onPress={() => setCustomModalVisible(true)}
        >
          <Text style={styles.actionButtonText}>✨ Crear Personalizada</Text>
        </TouchableOpacity>
      </View>

      {/* Panel de Solicitudes Pendientes (solo visible si hay pendientes) */}
      {pendingRequests.length > 0 && (
        <View style={styles.pendingPanel}>
          <View style={styles.pendingHeader}>
            <Text style={styles.pendingTitle}>🚨 Solicitudes Urgentes</Text>
            <Text style={styles.pendingCount}>{pendingRequests.length}</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.pendingScroll}
          >
            {pendingRequests.slice(0, 3).map(request => (
              <View key={request.id} style={styles.pendingCard}>
                <Text style={styles.pendingCardTitle}>{request.titulo}</Text>
                <Text style={styles.pendingCardUser}>👤 {request.usuario_solicitante_nombre}</Text>
                <Text style={styles.pendingCardTime}>{formatDate(request.created_at)}</Text>
                
                <View style={styles.pendingCardButtons}>
                  <TouchableOpacity
                    style={styles.quickApproveButton}
                    onPress={() => handleApproval(request, 'approve')}
                    disabled={processingApproval === request.id}
                  >
                    <Text style={styles.quickButtonText}>
                      {processingApproval === request.id ? '⏳' : '✅'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickRejectButton}
                    onPress={() => handleApproval(request, 'reject')}
                    disabled={processingApproval === request.id}
                  >
                    <Text style={styles.quickButtonText}>
                      {processingApproval === request.id ? '⏳' : '❌'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {pendingRequests.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllPendingCard}
                onPress={() => setSelectedFilter('pending')}
              >
                <Text style={styles.viewAllText}>Ver todas</Text>
                <Text style={styles.viewAllCount}>+{pendingRequests.length - 3}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Lista de notificaciones */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyMessage}>
              {selectedFilter === 'all' ? 'No hay notificaciones' : `No hay notificaciones: ${selectedFilter}`}
            </Text>
          </View>
        }
        contentContainerStyle={filteredNotifications.length === 0 ? styles.emptyList : null}
      />

      {/* Modal para crear notificación personalizada */}
      <Modal
        visible={customModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nueva Notificación</Text>
            <TouchableOpacity onPress={createCustomNotification}>
              <Text style={styles.modalSave}>Enviar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>📝 Título</Text>
            <TextInput
              style={styles.titleInput}
              value={customNotification.titulo}
              onChangeText={(text) => setCustomNotification(prev => ({ ...prev, titulo: text }))}
              placeholder="Título de la notificación"
              maxLength={100}
            />

            <Text style={styles.inputLabel}>💬 Mensaje</Text>
            <TextInput
              style={styles.messageInput}
              value={customNotification.mensaje}
              onChangeText={(text) => setCustomNotification(prev => ({ ...prev, mensaje: text }))}
              placeholder="Contenido de la notificación"
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <Text style={styles.inputLabel}>📁 Módulo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleContainer}>
              {['general', 'sistema', 'recetas', 'ingredientes', 'postres'].map(modulo => (
                <TouchableOpacity
                  key={modulo}
                  style={[
                    styles.moduleButton,
                    customNotification.modulo === modulo && styles.activeModuleButton
                  ]}
                  onPress={() => setCustomNotification(prev => ({ ...prev, modulo }))}
                >
                  <Text style={[
                    styles.moduleButtonText,
                    customNotification.modulo === modulo && styles.activeModuleButtonText
                  ]}>
                    {modulo.charAt(0).toUpperCase() + modulo.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>🎨 Tipo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
              {[
                { key: 'info', label: '📢 Info', color: '#007AFF' },
                { key: 'success', label: '✅ Éxito', color: '#28A745' },
                { key: 'warning', label: '⚠️ Aviso', color: '#FFC107' },
                { key: 'error', label: '❌ Error', color: '#DC3545' }
              ].map(tipo => (
                <TouchableOpacity
                  key={tipo.key}
                  style={[
                    styles.typeButton,
                    { borderColor: tipo.color },
                    customNotification.tipo === tipo.key && { backgroundColor: tipo.color }
                  ]}
                  onPress={() => setCustomNotification(prev => ({ ...prev, tipo: tipo.key }))}
                >
                  <Text style={[
                    styles.typeButtonText,
                    customNotification.tipo === tipo.key && { color: 'white' }
                  ]}>
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>👁️ Vista Previa:</Text>
              <View style={[styles.previewCard, { backgroundColor: getNotificationColor('no_leida', customNotification.tipo) }]}>
                <Text style={styles.previewCardTitle}>
                  {getNotificationIcon(customNotification.tipo)} {customNotification.titulo || 'Título de ejemplo'}
                </Text>
                <Text style={styles.previewCardMessage}>
                  {customNotification.mensaje || 'Mensaje de ejemplo...'}
                </Text>
                <Text style={styles.previewCardModule}>📁 {customNotification.modulo}</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  statBadge: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  serviceStatus: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  serviceStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  serviceStatusText: {
    fontSize: 12,
    color: '#856404',
  },
  adminInfo: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  adminSubtitle: {
    fontSize: 14,
    color: '#856404',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#17A2B8',
  },
  createButton: {
    backgroundColor: '#28A745',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationCard: {
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  notificationModule: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  notificationSender: {
    fontSize: 12,
    color: '#666',
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  approvalButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#28A745',
  },
  rejectButton: {
    backgroundColor: '#DC3545',
  },
  approvalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionIndicator: {
    marginTop: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCancel: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSave: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    height: 100,
    textAlignVertical: 'top',
  },
  moduleContainer: {
    marginBottom: 10,
  },
  moduleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 20,
    marginRight: 10,
  },
  activeModuleButton: {
    backgroundColor: '#007AFF',
  },
  moduleButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeModuleButtonText: {
    color: 'white',
  },
  typeContainer: {
    marginBottom: 10,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 20,
    marginRight: 10,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  previewCard: {
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  previewCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewCardMessage: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  previewCardModule: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  
  // Estilos para el panel de solicitudes pendientes
  pendingPanel: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  pendingCount: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  pendingScroll: {
    flexDirection: 'row',
  },
  pendingCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    width: 180,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  pendingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    numberOfLines: 2,
  },
  pendingCardUser: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  pendingCardTime: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  pendingCardButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  quickApproveButton: {
    flex: 1,
    backgroundColor: '#28A745',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickRejectButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllPendingCard: {
    backgroundColor: '#E9ECEF',
    padding: 12,
    borderRadius: 8,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  viewAllText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  viewAllCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  
  // Estilo para botones deshabilitados
  disabledButton: {
    opacity: 0.6,
  },
});

export default NotificationsScreen; 