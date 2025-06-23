import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

export const PostresScreen = () => {
  const { user, notifyDeletion, sendCustomNotification } = useAuth();
  const [postres, setPostres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPostre, setEditingPostre] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    loadPostres();
  }, []);

  const loadPostres = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPostres();
      setPostres(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los postres');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPostres();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingPostre(null);
    setFormData({ nombre: '', descripcion: '' });
    setModalVisible(true);
  };

  const openEditModal = (postre) => {
    setEditingPostre(postre);
    setFormData({
      nombre: postre.nombre,
      descripcion: postre.descripcion || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.nombre) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    try {
      const postreData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
      };

      // Si es administrador, ejecutar directamente
      if (user && user.rol === 'administrador') {
        if (editingPostre) {
          await apiService.updatePostre(editingPostre.id, postreData);
          Alert.alert('✅ Éxito', 'Postre actualizado');
        } else {
          await apiService.createPostre(postreData);
          Alert.alert('✅ Éxito', 'Postre creado');
        }
        setModalVisible(false);
        await loadPostres();
        return;
      }

      // Si es empleado, crear solicitud de aprobación
      if (user && user.rol === 'empleado') {
        const action = editingPostre ? 'actualizar' : 'crear';
        const actionText = editingPostre ? 'actualización' : 'creación';
        
        await sendCustomNotification({
          title: `📋 Solicitud de ${actionText} - Postre`,
          message: `${user.nombre} solicita ${action} el postre "${formData.nombre}". ¿Aprobar?`,
          module: 'postres',
          data: {
            action: action,
            postre: formData.nombre,
            descripcion: formData.descripcion,
            postreId: editingPostre?.id,
            usuario: user.nombre,
            rol: user.rol,
            originalData: editingPostre,
            newData: postreData,
            requiresApproval: true
          }
        });

        setModalVisible(false);
        Alert.alert(
          '📤 Solicitud Enviada',
          `Tu solicitud de ${actionText} del postre "${formData.nombre}" ha sido enviada al administrador para su aprobación.`,
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }

    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    }
  };

  const handleDelete = (postre) => {
    // Si es administrador, eliminar directamente
    if (user && user.rol === 'administrador') {
      Alert.alert(
        'Confirmar Eliminación',
        `¿Estás seguro de eliminar "${postre.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiService.deletePostre(postre.id);
                await loadPostres();
                Alert.alert('✅ Éxito', 'Postre eliminado');
              } catch (error) {
                Alert.alert('Error', 'No se pudo eliminar el postre');
              }
            },
          },
        ]
      );
      return;
    }

    // Si es empleado, crear solicitud de eliminación
    if (user && user.rol === 'empleado') {
      Alert.alert(
        'Solicitar Eliminación',
        `¿Solicitar eliminación de "${postre.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Solicitar',
            style: 'destructive',
            onPress: async () => {
              try {
                await sendCustomNotification({
                  title: '📋 Solicitud de Eliminación - Postre',
                  message: `${user.nombre} solicita eliminar el postre "${postre.nombre}". ¿Aprobar eliminación?`,
                  module: 'postres',
                  data: {
                    action: 'eliminar',
                    postre: postre.nombre,
                    postreId: postre.id,
                    usuario: user.nombre,
                    rol: user.rol,
                    originalData: postre,
                    requiresApproval: true
                  }
                });

                Alert.alert(
                  '📤 Solicitud Enviada',
                  `Tu solicitud de eliminación del postre "${postre.nombre}" ha sido enviada al administrador para su aprobación.`,
                  [{ text: 'Entendido', style: 'default' }]
                );
              } catch (error) {
                Alert.alert('Error', 'No se pudo enviar la solicitud');
              }
            },
          },
        ]
      );
    }
  };

  const renderPostre = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.postrefName}>{item.nombre}</Text>
                    {/* Precio removido */}
        {item.descripcion && (
          <Text style={styles.description}>{item.descripcion}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando postres...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧁 Postres</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={postres}
        renderItem={renderPostre}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay postres registrados</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPostre ? 'Editar Postre' : 'Nuevo Postre'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                placeholder="Nombre del postre"
              />
            </View>

            <View style={styles.inputContainer}>
                          {/* Campo precio removido */}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                placeholder="Descripción del postre"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
  },
  postrefName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 