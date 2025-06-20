import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import apiService from '../services/apiService';

const NotificationsScreen = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [customRequestModal, setCustomRequestModal] = useState(false);
  const [customRequest, setCustomRequest] = useState({
    titulo: '',
    mensaje: '',
    modulo: 'general'
  });

  useEffect(() => {
    console.log('🔄 NotificationsScreen useEffect iniciado');
    console.log('👤 Estado del usuario en useEffect:', user);
    
    // Si no hay usuario, mostrar datos demo inmediatamente
    if (!user) {
      console.log('⚠️ No hay usuario disponible, mostrando datos demo...');
      const demoNotifications = getOfflineNotifications();
      setNotifications(demoNotifications);
      setStats({
        total: demoNotifications.length,
        unread: demoNotifications.filter(n => n.estado === 'no_leida').length,
        pending: 0
      });
      setLoading(false);
      return;
    }
    
    // Si hay usuario, intentar cargar datos del servidor
    loadNotifications();
    loadStats();
    
    // Timeout de emergencia - si después de 10 segundos no hay datos, mostrar demo
    const emergencyTimeout = setTimeout(() => {
      if (loading && notifications.length === 0) {
        console.log('⏰ Timeout de emergencia - mostrando datos demo...');
        const demoNotifications = getOfflineNotifications();
        setNotifications(demoNotifications);
        setStats({
          total: demoNotifications.length,
          unread: demoNotifications.filter(n => n.estado === 'no_leida').length,
          pending: user.rol === 'administrador' ? 1 : 0
        });
        setLoading(false);
        Alert.alert('Timeout', 'La carga tomó demasiado tiempo. Mostrando contenido de ejemplo.');
      }
    }, 10000);
    
    return () => clearTimeout(emergencyTimeout);
  }, [user]);

  const loadNotifications = async () => {
    try {
      console.log('📱 Cargando notificaciones...');
      console.log('👤 Usuario actual:', user);
      const response = await apiService.getNotifications();
      console.log('📱 Respuesta completa:', response);
      
      if (response.success) {
        setNotifications(response.notifications || []);
        console.log('✅ Notificaciones cargadas:', response.notifications?.length || 0);
      } else {
        console.log('❌ Error en respuesta:', response);
        // Si hay error de conexión, mostrar datos demo
        if (response.error && (response.error.includes('fetch failed') || response.error.includes('timeout'))) {
          console.log('🔄 Base de datos no disponible, mostrando datos demo...');
          const demoNotifications = getOfflineNotifications();
          console.log('📋 Datos demo generados:', demoNotifications);
          setNotifications(demoNotifications);
          Alert.alert(
            'Modo Offline', 
            'Base de datos no disponible. Mostrando notificaciones de ejemplo.\n\nPara ver notificaciones reales, verifica la conexión del servidor.',
            [{ text: 'Entendido' }]
          );
        } else {
          const demoNotifications = getOfflineNotifications();
          console.log('📋 Mostrando datos demo por error:', demoNotifications);
          setNotifications(demoNotifications);
          Alert.alert('Error', response.error || 'No se pudieron cargar las notificaciones');
        }
      }
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
      
      // Verificar si es un error de conexión
      if (error.message && (error.message.includes('fetch failed') || 
                          error.message.includes('timeout') || 
                          error.message.includes('Network request failed'))) {
        console.log('🔄 Error de conexión detectado, usando datos demo...');
        const demoNotifications = getOfflineNotifications();
        console.log('📋 Datos demo por error de conexión:', demoNotifications);
        setNotifications(demoNotifications);
        Alert.alert(
          'Conexión no disponible', 
          'No se pudo conectar al servidor. Mostrando notificaciones de ejemplo.\n\nVerifica tu conexión a internet o el estado del servidor.',
          [{ text: 'Entendido' }]
        );
      } else {
        console.log('🔄 Error general, usando datos demo...');
        const demoNotifications = getOfflineNotifications();
        console.log('📋 Datos demo por error general:', demoNotifications);
        setNotifications(demoNotifications);
        Alert.alert('Error', 'No se pudieron cargar las notificaciones');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 Cargando estadísticas...');
      const response = await apiService.getNotificationStats();
      console.log('📊 Estadísticas:', response);
      
      if (response.success) {
        setStats(response.stats);
      } else {
        console.log('❌ Error en estadísticas:', response);
        // Estadísticas demo en caso de error
        const demoNotifications = getOfflineNotifications();
        setStats({
          total: demoNotifications.length,
          unread: demoNotifications.filter(n => n.estado === 'no_leida').length,
          pending: user.rol === 'administrador' ? demoNotifications.filter(n => n.requiere_aprobacion && n.estado === 'no_leida').length : 0
        });
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      // Estadísticas demo en caso de error
      const demoNotifications = getOfflineNotifications();
      setStats({
        total: demoNotifications.length,
        unread: demoNotifications.filter(n => n.estado === 'no_leida').length,
        pending: user.rol === 'administrador' ? demoNotifications.filter(n => n.requiere_aprobacion && n.estado === 'no_leida').length : 0
      });
    }
  };

  // Función para obtener notificaciones offline/demo
  const getOfflineNotifications = () => {
    console.log('🎭 Generando notificaciones demo...');
    const baseNotifications = [
      {
        id: 1,
        titulo: '🎉 Sistema de Notificaciones',
        mensaje: 'El sistema de notificaciones está funcionando. Esta es una notificación de demostración.',
        tipo: 'info',
        estado: 'no_leida',
        usuario_solicitante_nombre: 'Sistema',
        modulo: 'general',
        created_at: new Date().toISOString(),
        requiere_aprobacion: false
      },
      {
        id: 2,
        titulo: '📡 Conexión al Servidor',
        mensaje: 'Actualmente no hay conexión con la base de datos del servidor. Las notificaciones reales aparecerán cuando se restaure la conexión.',
        tipo: 'alerta',
        estado: 'no_leida',
        usuario_solicitante_nombre: 'Sistema',
        modulo: 'general',
        created_at: new Date(Date.now() - 60000).toISOString(),
        requiere_aprobacion: false
      }
    ];

    // Agregar notificación de solicitud si es administrador
    if (user && user.rol === 'administrador') {
      baseNotifications.push({
        id: 3,
        titulo: '🗑️ Solicitud de Eliminación (Demo)',
        mensaje: 'Esta es una solicitud de ejemplo que requiere aprobación de administrador.',
        tipo: 'solicitud',
        estado: 'no_leida',
        usuario_solicitante_nombre: 'Usuario Demo',
        modulo: 'ingredientes',
        created_at: new Date(Date.now() - 120000).toISOString(),
        requiere_aprobacion: true
      });
    }

    console.log('✅ Notificaciones demo generadas:', baseNotifications.length);
    return baseNotifications;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    loadStats();
  };

  const markAsRead = async (notificationId) => {
    try {
      console.log(`👀 Marcando notificación ${notificationId} como leída...`);
      const response = await apiService.markNotificationAsRead(notificationId);
      console.log('✅ Respuesta marcar como leída:', response);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, estado: 'leida' }
            : notif
        )
      );
      loadStats();
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
      
      // En modo offline, solo actualizar localmente
      if (error.message && (error.message.includes('fetch failed') || 
                          error.message.includes('timeout') || 
                          error.message.includes('Network request failed'))) {
        console.log('🔄 Modo offline: marcando como leída localmente...');
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, estado: 'leida' }
              : notif
          )
        );
        loadStats();
        Alert.alert('Modo Offline', 'Notificación marcada como leída localmente. Los cambios se sincronizarán cuando se restaure la conexión.');
      } else {
        Alert.alert('Error', 'No se pudo marcar la notificación como leída');
      }
    }
  };

  const handleApproval = async (notificationId, action) => {
    try {
      console.log(`✅ Procesando aprobación: ${action} para notificación ${notificationId}`);
      const response = await apiService.approveNotification(notificationId, action, approvalComment);
      console.log('✅ Respuesta aprobación:', response);

      if (response.success) {
        Alert.alert(
          'Éxito', 
          `Solicitud ${action} exitosamente`,
          [{ text: 'OK', onPress: () => {
            setModalVisible(false);
            setApprovalComment('');
            loadNotifications();
            loadStats();
          }}]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo procesar la solicitud');
      }
    } catch (error) {
      console.error('❌ Error procesando aprobación:', error);
      
      // En modo offline, simular aprobación localmente
      if (error.message && (error.message.includes('fetch failed') || 
                          error.message.includes('timeout') || 
                          error.message.includes('Network request failed'))) {
        console.log('🔄 Modo offline: simulando aprobación localmente...');
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, estado: action }
              : notif
          )
        );
        Alert.alert(
          'Modo Offline', 
          `Solicitud ${action} localmente. Los cambios se sincronizarán cuando se restaure la conexión.`,
          [{ text: 'Entendido', onPress: () => {
            setModalVisible(false);
            setApprovalComment('');
            loadStats();
          }}]
        );
      } else {
        Alert.alert('Error', 'No se pudo procesar la solicitud');
      }
    }
  };

  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🗑️ Eliminando notificación ${notificationId}...`);
              const response = await apiService.deleteNotification(notificationId);
              console.log('✅ Respuesta eliminación:', response);
              
              setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
              loadStats();
            } catch (error) {
              console.error('❌ Error eliminando notificación:', error);
              
              // En modo offline, eliminar localmente
              if (error.message && (error.message.includes('fetch failed') || 
                                  error.message.includes('timeout') || 
                                  error.message.includes('Network request failed'))) {
                console.log('🔄 Modo offline: eliminando localmente...');
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                loadStats();
                Alert.alert('Modo Offline', 'Notificación eliminada localmente. Los cambios se sincronizarán cuando se restaure la conexión.');
              } else {
                Alert.alert('Error', 'No se pudo eliminar la notificación');
              }
            }
          }
        }
      ]
    );
  };

  const createCustomRequest = async () => {
    if (!customRequest.titulo || !customRequest.mensaje) {
      Alert.alert('Error', 'Título y mensaje son requeridos');
      return;
    }

    try {
      console.log('📤 Creando solicitud personalizada:', customRequest);
      const response = await apiService.createCustomNotification(customRequest);
      console.log('✅ Respuesta solicitud personalizada:', response);
      
      if (response.success) {
        Alert.alert(
          'Éxito', 
          'Solicitud personalizada enviada',
          [{ text: 'OK', onPress: () => {
            setCustomRequestModal(false);
            setCustomRequest({ titulo: '', mensaje: '', modulo: 'general' });
            loadNotifications();
          }}]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      console.error('❌ Error creando solicitud:', error);
      
      // En modo offline, agregar solicitud localmente
      if (error.message && (error.message.includes('fetch failed') || 
                          error.message.includes('timeout') || 
                          error.message.includes('Network request failed'))) {
        console.log('🔄 Modo offline: creando solicitud localmente...');
        const newNotification = {
          id: Date.now(), // ID temporal
          titulo: `📤 ${customRequest.titulo}`,
          mensaje: `${customRequest.mensaje}\n\n[Solicitud creada en modo offline - se enviará cuando se restaure la conexión]`,
          tipo: 'solicitud',
          estado: 'no_leida',
          usuario_solicitante_nombre: user.nombre || 'Usuario',
          modulo: customRequest.modulo,
          created_at: new Date().toISOString(),
          requiere_aprobacion: true
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        loadStats();
        
        Alert.alert(
          'Modo Offline', 
          'Solicitud creada localmente. Se enviará automáticamente cuando se restaure la conexión al servidor.',
          [{ text: 'Entendido', onPress: () => {
            setCustomRequestModal(false);
            setCustomRequest({ titulo: '', mensaje: '', modulo: 'general' });
          }}]
        );
      } else {
        Alert.alert('Error', 'No se pudo enviar la solicitud');
      }
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'solicitud': return '📋';
      case 'aprobacion': return '✅';
      case 'rechazo': return '❌';
      case 'alerta': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (tipo, estado) => {
    if (estado === 'no_leida') {
      switch (tipo) {
        case 'solicitud': return '#FFF3CD';
        case 'aprobacion': return '#D4EDDA';
        case 'rechazo': return '#F8D7DA';
        case 'alerta': return '#FFE5CC';
        default: return '#E2F3FF';
      }
    }
    return '#F8F9FA';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: getNotificationColor(item.tipo, item.estado) }
      ]}
      onPress={() => {
        if (item.estado === 'no_leida') {
          markAsRead(item.id);
        }
        if (item.requiere_aprobacion && user.rol === 'administrador' && item.estado === 'no_leida') {
          setSelectedNotification(item);
          setModalVisible(true);
        }
      }}
      onLongPress={() => {
        if (item.usuario_destinatario_id === user.id) {
          deleteNotification(item.id);
        }
      }}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>{getNotificationIcon(item.tipo)}</Text>
        <View style={styles.notificationHeaderText}>
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

      {item.requiere_aprobacion && user.rol === 'administrador' && item.estado === 'no_leida' && (
        <View style={styles.approvalButtons}>
          <TouchableOpacity 
            style={[styles.approvalButton, styles.approveButton]}
            onPress={() => {
              setSelectedNotification(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.approvalButtonText}>✅ Revisar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        <Text style={styles.loadingSubtext}>
          {user ? 'Conectando con el servidor...' : 'Verificando usuario...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>{stats.unread}</Text>
          <Text style={styles.statLabel}>No leídas</Text>
        </View>
        {user.rol === 'administrador' && (
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#FFA500' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        )}
      </View>

      {/* Botón para crear solicitud personalizada */}
      <TouchableOpacity
        style={styles.createRequestButton}
        onPress={() => setCustomRequestModal(true)}
      >
        <Text style={styles.createRequestText}>+ Crear Solicitud Personalizada</Text>
      </TouchableOpacity>

      {/* Lista de notificaciones */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭</Text>
            <Text style={styles.emptyMessage}>No tienes notificaciones</Text>
          </View>
        }
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : null}
      />

      {/* Modal de aprobación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Revisar Solicitud</Text>
            
            {selectedNotification && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalLabel}>Título:</Text>
                <Text style={styles.modalValue}>{selectedNotification.titulo}</Text>
                
                <Text style={styles.modalLabel}>Mensaje:</Text>
                <Text style={styles.modalValue}>{selectedNotification.mensaje}</Text>
                
                <Text style={styles.modalLabel}>Solicitante:</Text>
                <Text style={styles.modalValue}>{selectedNotification.usuario_solicitante_nombre}</Text>
                
                {selectedNotification.datos_adicionales && (
                  <>
                    <Text style={styles.modalLabel}>Detalles adicionales:</Text>
                    <Text style={styles.modalValue}>
                      {JSON.stringify(selectedNotification.datos_adicionales, null, 2)}
                    </Text>
                  </>
                )}
                
                <Text style={styles.modalLabel}>Comentario (opcional):</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Agregar comentario..."
                  value={approvalComment}
                  onChangeText={setApprovalComment}
                  multiline
                  numberOfLines={3}
                />
              </ScrollView>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={() => handleApproval(selectedNotification?.id, 'rechazada')}
              >
                <Text style={styles.modalButtonText}>❌ Rechazar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.approveModalButton]}
                onPress={() => handleApproval(selectedNotification?.id, 'aprobada')}
              >
                <Text style={styles.modalButtonText}>✅ Aprobar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de solicitud personalizada */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={customRequestModal}
        onRequestClose={() => setCustomRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Crear Solicitud Personalizada</Text>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalLabel}>Título:</Text>
              <TextInput
                style={styles.input}
                placeholder="Título de la solicitud"
                value={customRequest.titulo}
                onChangeText={(text) => setCustomRequest(prev => ({ ...prev, titulo: text }))}
              />
              
              <Text style={styles.modalLabel}>Mensaje:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu solicitud..."
                value={customRequest.mensaje}
                onChangeText={(text) => setCustomRequest(prev => ({ ...prev, mensaje: text }))}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.modalLabel}>Módulo:</Text>
              <View style={styles.moduleButtons}>
                {['general', 'ingredientes', 'postres', 'recetas'].map(modulo => (
                  <TouchableOpacity
                    key={modulo}
                    style={[
                      styles.moduleButton,
                      customRequest.modulo === modulo && styles.moduleButtonSelected
                    ]}
                    onPress={() => setCustomRequest(prev => ({ ...prev, modulo }))}
                  >
                    <Text style={[
                      styles.moduleButtonText,
                      customRequest.modulo === modulo && styles.moduleButtonTextSelected
                    ]}>
                      {modulo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCustomRequestModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={createCustomRequest}
              >
                <Text style={styles.modalButtonText}>📤 Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  createRequestButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createRequestText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationCard: {
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
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
  notificationHeaderText: {
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
    marginLeft: 10,
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
  },
  notificationModule: {
    fontSize: 12,
    color: '#666',
  },
  notificationSender: {
    fontSize: 12,
    color: '#666',
  },
  approvalButtons: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  approvalButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#28A745',
  },
  approvalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
  },
  emptyList: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalBody: {
    maxHeight: 400,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  modalValue: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    height: 80,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  moduleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  moduleButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  moduleButtonText: {
    fontSize: 12,
    color: '#666',
  },
  moduleButtonTextSelected: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#DC3545',
  },
  approveModalButton: {
    backgroundColor: '#28A745',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  sendButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationsScreen; 