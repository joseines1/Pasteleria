import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

export const RecetasScreen = () => {
  const { user, notifyRecipeCreated, notifyDeletion, sendCustomNotification } = useAuth();
  
  const [recetas, setRecetas] = useState([]);
  const [postres, setPostres] = useState([
    { id: 1, nombre: 'Pastel de Chocolate (Demo)' },
    { id: 2, nombre: 'Tarta de Frutas (Demo)' },
    { id: 3, nombre: 'Cheesecake (Demo)' }
  ]);
  const [ingredientes, setIngredientes] = useState([
    { id: 1, nombre: 'Harina de Trigo (Demo)', stock: 15 },
    { id: 2, nombre: 'Azúcar (Demo)', stock: 8 },
    { id: 3, nombre: 'Mantequilla (Demo)', stock: 25 }
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReceta, setEditingReceta] = useState(null);
  const [formData, setFormData] = useState({
    idPostre: '',
    idIngrediente: '',
    cantidad: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [recetasData, postresData, ingredientesData] = await Promise.all([
        apiService.getRecetas(),
        apiService.getPostres(),
        apiService.getIngredientes(),
      ]);
      
      if (postresData.length > 0 && ingredientesData.length > 0) {
        setRecetas(recetasData);
        setPostres(postresData);
        setIngredientes(ingredientesData);
      }
    } catch (error) {
      console.log('⚠️ Servidor no disponible, manteniendo datos demo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
  };

  const openAddModal = () => {
    setEditingReceta(null);
    setFormData({ idPostre: '', idIngrediente: '', cantidad: '' });
    setModalVisible(true);
  };

  const openEditModal = (receta) => {
    setEditingReceta(receta);
    setFormData({
      idPostre: receta.idPostre?.toString() || '',
      idIngrediente: receta.idIngrediente?.toString() || '',
      cantidad: receta.cantidad?.toString() || '',
    });
    setModalVisible(true);
  };

  const handleDelete = (receta) => {
    // Si es administrador, eliminar directamente
    if (user && user.rol === 'administrador') {
      Alert.alert(
        '🗑️ Eliminar Receta',
        `¿Estás seguro de eliminar la receta de "${receta.postreNombre}" con "${receta.ingredienteNombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await apiService.deleteReceta(receta.id);
                await loadAllData();
                Alert.alert('✅ Éxito', 'Receta eliminada correctamente');
              } catch (error) {
                Alert.alert('❌ Error', 'No se pudo eliminar la receta');
                console.error('Error deleting receta:', error);
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
        `¿Solicitar eliminación de la receta "${receta.postreNombre}" con "${receta.ingredienteNombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Solicitar',
            style: 'destructive',
            onPress: async () => {
              try {
                await sendCustomNotification({
                  title: '📋 Solicitud de Eliminación - Receta',
                  message: `${user.nombre} solicita eliminar la receta: "${receta.postreNombre}" con "${receta.ingredienteNombre}". ¿Aprobar eliminación?`,
                  module: 'recetas',
                  data: {
                    action: 'eliminar',
                    postre: receta.postreNombre,
                    ingrediente: receta.ingredienteNombre,
                    cantidad: receta.cantidad,
                    recetaId: receta.id,
                    usuario: user.nombre,
                    rol: user.rol,
                    originalData: receta,
                    requiresApproval: true
                  }
                });

                Alert.alert(
                  '📤 Solicitud Enviada',
                  `Tu solicitud de eliminación de la receta "${receta.postreNombre}" ha sido enviada al administrador para su aprobación.`,
                  [{ text: 'Entendido', style: 'default' }]
                );
              } catch (error) {
                Alert.alert('❌ Error', 'No se pudo enviar la solicitud');
                console.error('Error sending deletion request:', error);
              }
            },
          },
        ]
      );
    }
  };

  const handleSave = async () => {
    if (!formData.idPostre || !formData.idIngrediente || !formData.cantidad) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    const cantidad = parseFloat(formData.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('❌ Cantidad Inválida', 'La cantidad debe ser un número mayor a 0');
      return;
    }

    try {
      const recetaData = {
        idPostre: parseInt(formData.idPostre),
        idIngrediente: parseInt(formData.idIngrediente),
        cantidad: cantidad,
      };

      const postreNombre = postres.find(p => p.id === recetaData.idPostre)?.nombre || 'Desconocido';
      const ingredienteNombre = ingredientes.find(i => i.id === recetaData.idIngrediente)?.nombre || 'Desconocido';

      // Si es administrador, ejecutar directamente
      if (user && user.rol === 'administrador') {
      if (editingReceta) {
        await apiService.updateReceta(editingReceta.id, recetaData);
          Alert.alert('✅ Receta Actualizada', 'La receta ha sido actualizada exitosamente');
      } else {
        await apiService.createReceta(recetaData);
          Alert.alert('🎉 ¡Receta Creada!', 'Nueva receta agregada exitosamente');
      }
      setModalVisible(false);
      await loadAllData();
      return;
    }

      // Si es empleado, crear solicitud de aprobación
      if (user && user.rol === 'empleado') {
        const action = editingReceta ? 'actualizar' : 'crear';
        const actionText = editingReceta ? 'actualización' : 'creación';
        
        await sendCustomNotification({
          title: `📋 Solicitud de ${actionText} - Receta`,
          message: `${user.nombre} solicita ${action} receta: "${postreNombre}" con ${ingredienteNombre} (${cantidad}). ¿Aprobar?`,
          module: 'recetas',
          data: {
            action: action,
            postre: postreNombre,
            ingrediente: ingredienteNombre,
            cantidad: cantidad,
            recetaId: editingReceta?.id,
            idPostre: recetaData.idPostre,
            idIngrediente: recetaData.idIngrediente,
            usuario: user.nombre,
            rol: user.rol,
            originalData: editingReceta,
            newData: recetaData,
            requiresApproval: true
          }
        });

        setModalVisible(false);
        Alert.alert(
          '📤 Solicitud Enviada',
          `Tu solicitud de ${actionText} de la receta "${postreNombre}" ha sido enviada al administrador para su aprobación.`,
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la solicitud');
      console.error('Error processing receta:', error);
    }
  };

  const getSelectedPostreName = () => {
    const postre = postres.find(p => p.id.toString() === formData.idPostre);
    return postre ? postre.nombre : 'Seleccionar Postre';
  };

  const getSelectedIngredienteName = () => {
    const ingrediente = ingredientes.find(i => i.id.toString() === formData.idIngrediente);
    return ingrediente ? ingrediente.nombre : 'Seleccionar Ingrediente';
  };

  const showPostrePicker = () => {
    const options = postres.map(p => p.nombre).concat('Cancelar');
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Selecciona un Postre',
      },
      (index) => {
        if (index < postres.length) {
          const selected = postres[index];
          setFormData({ ...formData, idPostre: selected.id.toString() });
        }
      }
    );
  };

  const showIngredientePicker = () => {
    const options = ingredientes.map(i => i.nombre).concat('Cancelar');
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Selecciona un Ingrediente',
      },
      (index) => {
        if (index < ingredientes.length) {
          const selected = ingredientes[index];
          setFormData({ ...formData, idIngrediente: selected.id.toString() });
        }
      }
    );
  };

  const renderReceta = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.recetaInfo}>
        <Text style={styles.recetaTitle}>{item.postreNombre}</Text>
        <Text style={styles.ingrediente}>📦 {item.ingredienteNombre}</Text>
        <Text style={styles.cantidad}>Cantidad: {item.cantidad}</Text>
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
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando recetas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Recetas</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={recetas}
        renderItem={renderReceta}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyMessage}>No hay recetas registradas</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Crear Primera Receta</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.cancelHeaderButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelHeaderText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingReceta ? 'Editar Receta' : 'Nueva Receta'}
            </Text>
            <TouchableOpacity
              style={styles.saveHeaderButton}
              onPress={handleSave}
            >
              <Text style={styles.saveHeaderText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.sectionTitle}>🧁 Seleccionar Postre</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={showPostrePicker}>
              <Text style={styles.selectorText}>
                🧁 {getSelectedPostreName()}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>🥫 Seleccionar Ingrediente</Text>
            <TouchableOpacity style={styles.selectorButton} onPress={showIngredientePicker}>
              <Text style={styles.selectorText}>
                🥫 {getSelectedIngredienteName()}
              </Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>📏 Cantidad Necesaria</Text>
              <TextInput
                style={styles.quantityInput}
              placeholder="Ej: 2.5"
                value={formData.cantidad}
                onChangeText={(text) => setFormData({ ...formData, cantidad: text })}
                keyboardType="decimal-pad"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
    backgroundColor: '#f8f9fa',
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recetaInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#f39c12',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  recetaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  ingrediente: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  cantidad: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    color: '#666',
    marginBottom: 20,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    borderBottomColor: '#e9ecef',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
  },
  cancelHeaderButton: {
    padding: 8,
  },
  cancelHeaderText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveHeaderButton: {
    padding: 8,
  },
  saveHeaderText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    marginTop: 10,
  },
  selectorButton: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectorText: {
    fontSize: 16,
    color: '#7f8c8d',
    flex: 1,
  },
  selectorArrow: {
    fontSize: 12,
    color: '#3498db',
    marginLeft: 10,
  },
  quantityInput: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
